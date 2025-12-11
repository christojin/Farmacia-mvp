import { useState } from 'react';
import { Search, Package, Snowflake, FileText, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { products, categories, productPrices, productLots } from '../../data/mockData';
import clsx from 'clsx';

export function ProductGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addToCart } = useStore();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const getProductStock = (productId: string) => {
    return productLots
      .filter(l => l.productId === productId)
      .reduce((sum, lot) => sum + lot.quantity, 0);
  };

  const getProductPrice = (productId: string) => {
    return productPrices.find(p => p.productId === productId)?.price || 0;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, código o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-lg pl-11"
            autoFocus
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={clsx(
            'btn btn-sm whitespace-nowrap',
            !selectedCategory ? 'btn-primary' : 'btn-secondary'
          )}
        >
          Todos
        </button>
        {categories.filter(c => !c.parentId).map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={clsx(
              'btn btn-sm whitespace-nowrap',
              selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'
            )}
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : undefined,
              borderColor: selectedCategory === category.id ? category.color : undefined,
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="pos-product-grid">
          {filteredProducts.map(product => {
            const stock = getProductStock(product.id);
            const price = getProductPrice(product.id);
            const isLowStock = stock <= product.minStock;
            const isOutOfStock = stock === 0;

            return (
              <button
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product.id)}
                disabled={isOutOfStock}
                className={clsx(
                  'card pos-product-card card-hover relative',
                  isOutOfStock && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Indicators */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.requiresColdChain && (
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center" title="Cadena fría">
                      <Snowflake size={14} className="text-blue-500" />
                    </span>
                  )}
                  {product.requiresPrescription && (
                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center" title="Requiere receta">
                      <FileText size={14} className="text-amber-500" />
                    </span>
                  )}
                  {product.isControlled && (
                    <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center" title="Controlado">
                      <AlertCircle size={14} className="text-red-500" />
                    </span>
                  )}
                </div>

                {/* Product Icon */}
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-2',
                  isLowStock ? 'bg-amber-100' : 'bg-teal-100'
                )}>
                  <Package size={24} className={isLowStock ? 'text-amber-600' : 'text-teal-600'} />
                </div>

                {/* Product Info */}
                <h4 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">
                  {product.name}
                </h4>
                <p className="text-lg font-bold text-teal-600">
                  ${price.toFixed(2)}
                </p>
                <p className={clsx(
                  'text-xs',
                  isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-slate-400'
                )}>
                  {isOutOfStock ? 'Sin stock' : `Stock: ${stock}`}
                </p>

                {/* Fractional indicator */}
                {product.isFractional && (
                  <span className="badge badge-info text-[10px] mt-1">
                    Fraccionable
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
