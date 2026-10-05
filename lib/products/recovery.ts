export type LoadStatus="loading"|"error"|"ready";
export async function withCatalogTimeout<T>(request:Promise<T>, milliseconds=15000):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([request,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error("catalog timeout")),milliseconds);})]);}
 finally{clearTimeout(timer);}
}
export function readCartStorage():unknown{
 try{const value=window.localStorage.getItem("ara-lot-cart");return value?JSON.parse(value):[];}catch{return [];}
}
export function writeCartStorage(items:unknown){
 try{window.localStorage.setItem("ara-lot-cart",JSON.stringify(items));return true;}catch{return false;}
}
