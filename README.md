# Black Flag Improvements

A Foundry VTT module for the Black Flag system. It adds **Macro** to the available activity types.

A macro activity can either execute an existing world or compendium macro by UUID or store JavaScript directly in the activity. When activated, the normal Black Flag workflow (dialog, resource consumption, and chat card) is completed before the macro runs.

In addition to Foundry's standard variables, the macro receives `actor`, `token`, `item`, `activity`, `event`, `message`, and `results`.

The module also includes a complete Item Piles integration for Black Flag, covering currencies, merchant prices, containers, item filters, stacking rules, and vault colors. Unlike the previous adapter, this integration correctly respects `system.price.denomination`. Black Flag's conversion values (units per GP) are converted to the GP value per unit expected by Item Piles.

The separate `item-piles-black-flag` module must be disabled because both modules would otherwise register the same system integration.

Custom Weapon Properties and Weapon Options can be created under **Game Settings → Configure Settings → Module Settings → Black Flag Improvements**. In addition to display-only entries, the module provides mechanics for Versatile, Finesse, Light, Thrown, Two-Handed, Reach, and configurable attack and damage bonuses. Versatile die steps and reach bonuses can be customized. A mechanic can be attached to either a custom Property or a custom Weapon Option.

The **Weapon Enchantment** activity type supports spells such as Shillelagh or Magic Weapon. When activated, it prompts the user to select one of the actor's weapons. The enchantment can override the ability used, set a minimum or replacement damage die, make the weapon magical, and add attack or damage formulas. The resulting effect has a configurable duration and can be removed from either the chat card or the weapon itself.

## Installation

Install the module in Foundry using this manifest URL:

```text
https://raw.githubusercontent.com/RedPandaSweg/black-flag-improvements/main/module.json
```

## Compatibility

Developed for Foundry VTT 13 and Black Flag 2.0.074. Item Piles 3.2.7 or newer is optional; when active, the integration and currencies are configured automatically.
