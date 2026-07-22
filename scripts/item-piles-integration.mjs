const MODULE_ID = "black-flag-improvements";
const VERSION = game.modules.get(MODULE_ID)?.version ?? "0.0.0";

const ITEM_FILTERS = [{
  path: "type",
  filters: "background,class,feature,heritage,lineage,spell,subclass,talent"
}];
const ITEM_SIMILARITIES = ["name", "type"];
const UNSTACKABLE_ITEM_TYPES = ["container", "armor", "weapon"];

let registrationPromise;
let chatCompatibilityInstalled = false;

function buildCurrencies() {
  const currencies = foundry.utils.deepClone(CONFIG.BlackFlag?.currencies ?? {});
  const registered = CONFIG.BlackFlag?.registration?.list("currency") ?? {};
  for (const [denomination, registration] of Object.entries(registered)) {
    const item = registration.cached;
    if (!item) continue;
    currencies[denomination] = {
      ...currencies[denomination],
      label: registration.name ?? item.name,
      abbreviation: denomination,
      conversion: item.system.conversion.value,
      uuid: item.uuid,
      item
    };
  }
  return Object.entries(currencies)
    .filter(([, config]) => config?.uuid && Number(config.conversion) > 0)
    .map(([denomination, config]) => ({
      type: "item",
      name: game.i18n.localize(config.label),
      img: null,
      abbreviation: `{#}${denomination.toUpperCase()}`,
      data: { uuid: config.uuid, ...(config.item ? { item: config.item.toObject() } : {}) },
      primary: denomination === "gp",
      // Black Flag stores "units per gp"; Item Piles stores "gp value per unit".
      exchangeRate: 1 / Number(config.conversion)
    }));
}

function getItemCost(item) {
  const value = Number(foundry.utils.getProperty(item, "system.price.value"));
  if (!Number.isFinite(value) || value <= 0) return 0;

  const denomination = foundry.utils.getProperty(item, "system.price.denomination") || "gp";
  const conversion = Number(CONFIG.BlackFlag?.currencies?.[denomination]?.conversion);
  if (!Number.isFinite(conversion) || conversion <= 0) {
    console.warn(`${MODULE_ID} | Unknown price denomination "${denomination}"; treating it as gp.`, item);
    return value;
  }

  return value / conversion;
}

function installChatCompatibility() {
  if (chatCompatibilityInstalled) return;
  chatCompatibilityInstalled = true;
  Hooks.on("renderChatMessageHTML", (_app, html) => {
    if (!html || html.find) return;
    html.find = selector => $(html).find(selector);
    html.closest = selector => $(html).closest(selector);
  });
}

function getIntegrationData(currencies) {
  const methods = game.itempiles.CONSTANTS.ITEM_TYPE_METHODS;
  return {
    VERSION,
    ACTOR_CLASS_TYPE: "pc",
    ITEM_CLASS_LOOT_TYPE: "sundry",
    ITEM_CLASS_WEAPON_TYPE: "weapon",
    ITEM_CLASS_EQUIPMENT_TYPE: "gear",
    ITEM_QUANTITY_ATTRIBUTE: "system.quantity",
    ITEM_PRICE_ATTRIBUTE: "system.price.value",
    QUANTITY_FOR_PRICE_ATTRIBUTE: "flags.item-piles.system.quantityForPrice",
    ITEM_FILTERS,
    ITEM_SIMILARITIES,
    UNSTACKABLE_ITEM_TYPES,
    CURRENCIES: currencies,
    CURRENCY_DECIMAL_DIGITS: 1e-5,
    PILE_DEFAULTS: {},

    ITEM_TRANSFORMER: itemData => {
      if (itemData?.flags?.["black-flag"]?.relationship?.attuned) {
        foundry.utils.setProperty(itemData, "flags.black-flag.relationship.attuned", false);
      }
      return itemData;
    },

    PRICE_MODIFIER_TRANSFORMER: ({ buyPriceModifier, sellPriceModifier } = {}) => ({
      buyPriceModifier,
      sellPriceModifier
    }),

    ITEM_COST_TRANSFORMER: getItemCost,

    ITEM_TYPE_HANDLERS: {
      GLOBAL: {
        [methods.IS_CONTAINED]: ({ item }) => {
          const itemData = item instanceof Item ? item.toObject() : item;
          return itemData?.system?.container;
        },
        [methods.IS_CONTAINED_PATH]: "system.container"
      },
      container: {
        [methods.HAS_CURRENCY]: true,
        [methods.CONTENTS]: ({ item }) => {
          if (!item.parent) return [];
          return item.parent.items.filter(entry => entry.system.container === item.id);
        },
        [methods.TRANSFER]: ({ item, items, raw = false } = {}) => {
          if (!item.parent) return items;
          const contents = item.parent.items
            .filter(entry => entry.system.container === item.id)
            .map(entry => raw ? entry : entry.toObject());
          return [...items, ...contents];
        }
      }
    },

    VAULT_STYLES: [
      { path: "system.rarity", value: "artifact", styling: { "box-shadow": "inset 0 0 7px rgba(255,191,0,1)" } },
      { path: "system.rarity", value: "legendary", styling: { "box-shadow": "inset 0 0 7px rgba(255,119,0,1)" } },
      { path: "system.rarity", value: "veryRare", styling: { "box-shadow": "inset 0 0 7px rgba(255,0,247,1)" } },
      { path: "system.rarity", value: "rare", styling: { "box-shadow": "inset 0 0 7px rgba(0,136,255,1)" } },
      { path: "system.rarity", value: "uncommon", styling: { "box-shadow": "inset 0 0 7px rgba(0,255,9,1)" } }
    ],

    SYSTEM_HOOKS: installChatCompatibility
  };
}

async function persistSettings(currencies) {
  if (!game.user?.isGM) return;
  const api = game.itempiles.API;
  await api.setActorClassType("pc");
  await api.setItemQuantityAttribute("system.quantity");
  await api.setItemPriceAttribute("system.price.value");
  await api.setItemFilters(ITEM_FILTERS);
  await api.setItemSimilarities(ITEM_SIMILARITIES);
  await api.setUnstackableItemTypes(UNSTACKABLE_ITEM_TYPES);
  await api.setPileDefaults({});
  if (currencies.length) {
    await api.setCurrencies(currencies);
    console.log(`${MODULE_ID} | Synchronized ${currencies.length} Item Piles currencies: ${currencies.map(c => c.abbreviation.replace("{#}", "")).join(", ")}`);
  }
}

async function synchronizeCurrencies() {
  if (!game.itempiles || !game.user?.isGM) return [];
  const currencies = buildCurrencies();
  if (!currencies.length) {
    console.warn(`${MODULE_ID} | Black Flag currency registration is not ready yet.`);
    return [];
  }
  await game.itempiles.API.setCurrencies(currencies);
  console.log(`${MODULE_ID} | Item Piles currencies updated (${currencies.length}).`);
  return currencies;
}

async function registerIntegration() {
  if (registrationPromise) return registrationPromise;
  registrationPromise = (async () => {
    if (game.system.id !== "black-flag" || !game.itempiles) return;

    if (game.modules.get("item-piles-black-flag")?.active) {
      ui.notifications.warn(game.i18n.localize("BFI.ItemPiles.AdapterConflict"), { permanent: true });
      console.warn(`${MODULE_ID} | Disable item-piles-black-flag; this module now provides that integration.`);
    }

    let currencies = buildCurrencies();
    game.itempiles.API.addSystemIntegration(getIntegrationData(currencies));

    if (game.user) await persistSettings(currencies);

    if (!currencies.length) {
      Hooks.once("blackFlag.registrationComplete", synchronizeCurrencies);
    }

    // This also covers the case where registrationComplete fired before Item Piles became ready.
    if (game.ready) await synchronizeCurrencies();
    else Hooks.once("ready", synchronizeCurrencies);

    console.log(`${MODULE_ID} | Item Piles integration registered with denomination-aware prices.`);
  })().catch(error => {
    registrationPromise = undefined;
    console.error(`${MODULE_ID} | Item Piles integration failed.`, error);
    ui.notifications.error(game.i18n.format("BFI.ItemPiles.Error", { message: error.message }));
  });
  return registrationPromise;
}

Hooks.once("init", () => {
  if (game.system.id !== "black-flag") return;
  installChatCompatibility();
  Hooks.once("item-piles-ready", registerIntegration);
  if (game.itempiles) registerIntegration();
});
