import { useEffect, useMemo, useState } from 'react'
import { ProductList } from './Components/ProductList'
import './e-commerce-stylesheet.css'

type Product = {
  id: number
  name: string
  price: number
  category: string
  quantity: number
  rating: number
  image_link: string
}

type BasketItem = {
  id: number
  name: string
  price: number
  quantity: number
}

function App() {
  // Products loaded from public/Assets
  const [products, setProducts] = useState<Product[]>([])

  // Search / filter / sort controls
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortOption, setSortOption] = useState<string>('AtoZ')
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)

  // Basket state
  const [basketOpen, setBasketOpen] = useState<boolean>(false)
  const [basket, setBasket] = useState<BasketItem[]>([])

  // Load products JSON once on mount
  useEffect(() => {
    fetch('/Assets/random_products_175.json')
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
  }, [])

  // Build displayed product list: search -> inStock -> sort
  const displayedProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    let list = products.filter((p) => p.name.toLowerCase().includes(term))

    if (inStockOnly) {
      list = list.filter((p) => p.quantity > 0)
    }

    return [...list].sort((a, b) => {
      switch (sortOption) {
        case 'ZtoA':
          return b.name.localeCompare(a.name)
        case '£LtoH':
          return a.price - b.price
        case '£HtoL':
          return b.price - a.price
        case '*LtoH':
          return a.rating - b.rating
        case '*HtoL':
          return b.rating - a.rating
        case 'AtoZ':
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }, [products, searchTerm, sortOption, inStockOnly])

  // Results indicator text
  const resultsText = useMemo(() => {
    const termEmpty = searchTerm.trim().length === 0

    if (termEmpty) {
      const n = products.length
      return n === 1 ? '1 Product' : `${n} Products`
    }

    const m = displayedProducts.length
    if (m === 0) return 'No search results found'
    return m === 1 ? '1 Result' : `${m} Results`
  }, [searchTerm, products.length, displayedProducts.length])

  // Basket: add
  function addToBasket(product: Product) {
    setBasket((prev) => {
      const existing = prev.find((x) => x.id === product.id)
      if (existing) {
        return prev.map((x) =>
          x.id === product.id ? { ...x, quantity: x.quantity + 1 } : x
        )
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, quantity: 1 },
      ]
    })
  }

  // Basket: remove 1 (remove row when quantity hits 0)
  function removeFromBasket(productId: number) {
    setBasket((prev) => {
      const target = prev.find((x) => x.id === productId)
      if (!target) return prev

      if (target.quantity <= 1) {
        return prev.filter((x) => x.id !== productId)
      }

      return prev.map((x) =>
        x.id === productId ? { ...x, quantity: x.quantity - 1 } : x
      )
    })
  }

  // Total cost
  const totalCost = useMemo(() => {
    return basket.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [basket])

  return (
    <div id="container">
      <div id="logo-bar">
        <div id="logo-area">
          <img src="/Assets/logo.png"></img>
        </div>

        <div id="shopping-icon-area">
          <img
            id="shopping-icon"
            onClick={() => setBasketOpen(true)}
            src="/Assets/shopping-basket.png"
          ></img>
        </div>

        <div id="shopping-area" style={{ display: basketOpen ? 'block' : 'none' }}>
          <div id="exit-area">
            <p id="exit-icon" onClick={() => setBasketOpen(false)}>
              x
            </p>
          </div>

          {basket.length === 0 ? (
            <p>Your basket is empty</p>
          ) : (
            <>
              {basket.map((item) => (
                <div className="shopping-row" key={item.id}>
                  <div className="shopping-information">
                    <p>
                      {item.name} (£{item.price.toFixed(2)}) - {item.quantity}
                    </p>
                  </div>
                  <button onClick={() => removeFromBasket(item.id)}>Remove</button>
                </div>
              ))}
              <p>Total: £{totalCost.toFixed(2)}</p>
            </>
          )}
        </div>
      </div>

      <div id="search-bar">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
        ></input>

        <div id="control-area">
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="AtoZ">By name (A - Z)</option>
            <option value="ZtoA">By name (Z - A)</option>
            <option value="£LtoH">By price (low - high)</option>
            <option value="£HtoL">By price (high - low)</option>
            <option value="*LtoH">By rating (low - high)</option>
            <option value="*HtoL">By rating (high - low)</option>
          </select>

          <input
            id="inStock"
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          ></input>
          <label htmlFor="inStock">In stock</label>
        </div>
      </div>

      <p id="results-indicator">{resultsText}</p>

      <ProductList itemList={displayedProducts} onAddToBasket={addToBasket} />
    </div>
  )
}

export default App