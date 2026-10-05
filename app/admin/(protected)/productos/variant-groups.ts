import { emptyVariant, type VariantDraft } from "./model";
export type ColorGroup = { key: string; color: string; image: string; variants: VariantDraft[] };
export function groupColors(variants: VariantDraft[]): ColorGroup[] {
 const groups: ColorGroup[]=[];
 for(const variant of variants) {
  if(variant.presentation && !variant.color && !variant.size) continue;
  let group=groups.find(g=>g.color===variant.color);
  if(!group){group={key:"color-"+groups.length,color:variant.color,image:variant.image_url,variants:[]};groups.push(group);}
  group.variants.push({...variant});
 }
 return groups;
}
export function collectVariants(original: VariantDraft[], visible: VariantDraft[]): VariantDraft[] {
 const ids=new Set(visible.map(v=>v.id).filter(Boolean));
 return [...visible.filter(v=>v.id||v.active),...original.filter(v=>v.id&&!ids.has(v.id)).map(v=>({...v,active:false}))].map(v => {
  const previous = original.find(item => item.id === v.id);
  return {...v, stock_changed: Boolean(v.id && previous && (Number(v.quantity) !== Number(previous.quantity) || Number(v.low_stock_threshold) !== Number(previous.low_stock_threshold))), expected_inventory_updated_at: previous?.expected_inventory_updated_at};
 });
}
export function newColor(): ColorGroup {
 return {key:crypto.randomUUID(),color:"",image:"",variants:["S","M","L","XL"].map(size=>({...emptyVariant(),size,active:false}))};
}
