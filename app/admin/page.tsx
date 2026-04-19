'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, Users, ShoppingBag, RefreshCcw, X, Check, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { Product, Category, Order } from '@/lib/types'
import { formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils'

type AdminTab = 'overview' | 'products' | 'orders' | 'users'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalUsers: 0, revenue: 0 })

  const [newProduct, setNewProduct] = useState({
    name: '', category_id: '', price: '', mrp: '', description: '', brand: '',
    image_url: '', weight_value: '', weight_unit: 'g', stock: '100',
    is_morning_delivery_available: false,
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    if (!isAdmin) {
      router.push('/')
      return
    }
    loadData()
  }, [user, isAdmin])

  async function loadData() {
    setLoading(true)
    const [catRes, prodRes, orderRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ])
    if (catRes.data) setCategories(catRes.data)
    if (prodRes.data) setProducts(prodRes.data as Product[])
    if (orderRes.data) {
      setOrders(orderRes.data as Order[])
      setStats({
        totalOrders: orderRes.data.length,
        totalProducts: prodRes.data?.length || 0,
        totalUsers: 0,
        revenue: orderRes.data.reduce((s, o) => s + o.total_price, 0),
      })
    }
    setLoading(false)
  }

  async function saveProduct() {
    if (!newProduct.name || !newProduct.category_id || !newProduct.price) {
      alert('Fill required fields: Name, Category, Price')
      return
    }
    const payload = {
      name: newProduct.name,
      category_id: newProduct.category_id,
      price: parseFloat(newProduct.price),
      mrp: parseFloat(newProduct.mrp) || parseFloat(newProduct.price),
      description: newProduct.description,
      brand: newProduct.brand,
      image_url: newProduct.image_url,
      weight_value: newProduct.weight_value ? parseFloat(newProduct.weight_value) : null,
      weight_unit: newProduct.weight_unit,
      stock: parseInt(newProduct.stock),
      is_morning_delivery_available: newProduct.is_morning_delivery_available,
    }
    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id)
    } else {
      await supabase.from('products').insert(payload)
    }
    setShowAddProduct(false)
    setEditingProduct(null)
    setNewProduct({ name: '', category_id: '', price: '', mrp: '', description: '', brand: '', image_url: '', weight_value: '', weight_unit: 'g', stock: '100', is_morning_delivery_available: false })
    loadData()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').update({ is_active: false }).eq('id', id)
    loadData()
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    loadData()
  }

  if (!user || !isAdmin) return null

  return (
    <div className="container-app py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Dashboard ⚡</h1>
          <p className="text-gray-400 text-sm">VinayNagarMarT management panel</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scroll-x">
        {([
          { key: 'overview' as const, label: 'Overview', icon: '📊' },
          { key: 'products' as const, label: 'Products', icon: '📦' },
          { key: 'orders' as const, label: 'Orders', icon: '🛒' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
              tab === t.key ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: '🛒', color: '#2563eb' },
            { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: '#16a34a' },
            { label: 'Revenue', value: formatPrice(stats.revenue), icon: '💰', color: '#7c3aed' },
            { label: 'Categories', value: categories.length, icon: '🏷️', color: '#ea580c' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Products ({products.length})</h2>
            <button
              onClick={() => { setShowAddProduct(true); setEditingProduct(null) }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          {/* Add/Edit product form */}
          {showAddProduct && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => { setShowAddProduct(false); setEditingProduct(null) }} className="p-1 hover:bg-gray-100 rounded">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', placeholder: 'Product Name *', col: 2 },
                  { key: 'brand', placeholder: 'Brand', col: 1 },
                  { key: 'price', placeholder: 'Price (₹) *', col: 1 },
                  { key: 'mrp', placeholder: 'MRP (₹)', col: 1 },
                  { key: 'stock', placeholder: 'Stock', col: 1 },
                  { key: 'weight_value', placeholder: 'Weight Value (e.g. 500)', col: 1 },
                  { key: 'weight_unit', placeholder: 'Unit (g/ml/pcs)', col: 1 },
                  { key: 'image_url', placeholder: 'Image URL', col: 2 },
                  { key: 'description', placeholder: 'Description', col: 2 },
                ].map(field => (
                  <div key={field.key} style={{ gridColumn: `span ${field.col}` }}>
                    {field.key === 'description' ? (
                      <textarea
                        placeholder={field.placeholder}
                        value={newProduct[field.key as keyof typeof newProduct] as string}
                        onChange={e => setNewProduct(p => ({ ...p, [field.key]: e.target.value }))}
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={newProduct[field.key as keyof typeof newProduct] as string}
                        onChange={e => setNewProduct(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                      />
                    )}
                  </div>
                ))}
                
                {/* Category selector */}
                <div className="col-span-2">
                  <select
                    value={newProduct.category_id}
                    onChange={e => setNewProduct(p => ({ ...p, category_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                  >
                    <option value="">Select Category *</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Morning delivery toggle */}
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.is_morning_delivery_available}
                      onChange={e => setNewProduct(p => ({ ...p, is_morning_delivery_available: e.target.checked }))}
                      className="w-4 h-4 accent-green-600"
                    />
                    <span className="text-sm font-medium">🌅 Morning Delivery Available</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveProduct} className="btn-primary flex items-center gap-2 text-sm">
                  <Check size={16} />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  onClick={() => { setShowAddProduct(false); setEditingProduct(null) }}
                  className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Products table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Stock</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : products.map(prod => (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {prod.image_url && (
                            <img src={prod.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{prod.name}</p>
                            {prod.brand && <p className="text-xs text-gray-400">{prod.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{(prod.category as any)?.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{formatPrice(prod.price)}</span>
                        {prod.mrp > prod.price && (
                          <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(prod.mrp)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${prod.stock < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                          {prod.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(prod)
                              setNewProduct({
                                name: prod.name, category_id: prod.category_id, price: prod.price.toString(),
                                mrp: prod.mrp.toString(), description: prod.description || '', brand: prod.brand || '',
                                image_url: prod.image_url || '', weight_value: prod.weight_value?.toString() || '',
                                weight_unit: prod.weight_unit || 'g', stock: prod.stock.toString(),
                                is_morning_delivery_available: prod.is_morning_delivery_available,
                              })
                              setShowAddProduct(true)
                            }}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div>
          <h2 className="font-bold text-gray-900 mb-4">Orders ({orders.length})</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Order #</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Delivery</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No orders yet</td></tr>
                  ) : orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-bold">{formatPrice(order.total_price)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {order.delivery_type === 'morning' ? '🌅' : '⚡'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-green-500"
                        >
                          {['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                            <option key={s} value={s}>{getStatusLabel(s)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
