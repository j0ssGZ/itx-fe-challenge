// Test-only fixtures from the unchanged, sanitized M01 evidence. Never import
// this module into production modules. Robustness variations are labeled in tests.
import evidence from '../../docs/evidence/m01/2026-11-09/responses.json'

export const productList = evidence.productList
export const productDetails = evidence.productDetails
export const unknownProductError = evidence.unknownProduct
