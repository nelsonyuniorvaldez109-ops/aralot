"use server";
import { getProducts } from "./server";
export async function refreshCatalog() {return getProducts();}
