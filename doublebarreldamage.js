const weaponActions = [...game.user.character.system.actions.filter(a => a.weaponTraits.some(wt => wt.name === "double-barrel"))];
const weaponOptions = weaponActions.map(w => `<option value=${w.item.id}>${w.item.name}</option>`).join(``);
const dialogContent = `<div>Selected Double Barrel Weapon: <select name="weapon">${weaponOptions}</select></div>`;
const blastEm = async (html) => {
    const selectedWeaponId = html.find("[name=weapon]")[0].value;
    const selectedWeapon = game.user.character.inventory.find(i => i.id == selectedWeaponId);
    const originalDamage = String(selectedWeapon.baseDamage.die);
    const originalFatalTag = [...selectedWeapon.traits.values()].find(v => v.includes('fatal-'));
    const newDamage = `d${Number(originalDamage.split('d')[1]) + 2}`;
    const newFatalTag = `fatal-d${Number(originalFatalTag.split('d')[1]) + 2}`;
    const originalTraitSet = [...selectedWeapon.traits];
    const newTraitSet = new Set(originalTraitSet);

    newTraitSet.delete(originalFatalTag);
    newTraitSet.add(newFatalTag);
    console.log(selectedWeapon.ammo);
    if(!selectedWeapon.ammo?.quantity || selectedWeapon.ammo.quantity < 2){
        ui.notifications.warn("Looks like it's their lucky day. You don't have enough ammo!");
        return;
    }

    console.log(`Originals: ${originalDamage}, ${originalTraitSet}\n Double Barrel: ${newDamage}, ${[...newTraitSet]}`);
    await selectedWeapon.update({ "system.damage.die": newDamage, "system.traits.value": [...newTraitSet] });
    await weaponActions.find(wa => wa.item.id == selectedWeaponId).attack();
    await weaponActions.find(wa => wa.item.id == selectedWeaponId).damage();
    await weaponActions.find(wa => wa.item.id == selectedWeaponId).critical();
    await selectedWeapon.update({ "system.damage.die": originalDamage, "system.traits.value": [...originalTraitSet]});
    await selectedWeapon.ammo.update({ "system.quantity": selectedWeapon.ammo.system.quantity - 1 });
}

let d = new Dialog({
 title: "Double Barrel Utility",
 content: dialogContent,
 buttons: {
  shoot: {
   icon: '<i class="fas fa-check"></i>',
   label: "Blast em!",
   callback: async (html) => await blastEm(html)
  },
  close : {
   icon: '<i class="fas fa-times"></i>',
   label: "Not worth the ammo...",
   callback: () => {return}
  }
 },
 default: "close",
 render: html => console.log("Opening double barrel dialog"),
 close: html => console.log("Closing double barrel dialog")
});
d.render(true);