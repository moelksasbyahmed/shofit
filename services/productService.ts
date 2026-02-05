import { API_BASE_URL } from "@/constants/api";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  in_stock: boolean;
  available_colors: string[];
  available_sizes: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  detail?: string;
}

class ProductService {
  private baseUrl = `${API_BASE_URL}/api/products`;

  /**
   * Get all products with optional filtering
   */
  async getAllProducts(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    search?: string,
  ): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (minPrice !== undefined) params.append("min_price", minPrice.toString());
    if (maxPrice !== undefined) params.append("max_price", maxPrice.toString());
    if (search) params.append("search", search);

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data: ApiResponse<Product[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/${productId}`);
      if (!response.ok) {
        throw new Error(`Product not found: ${productId}`);
      }
      const data: ApiResponse<Product> = await response.json();
      if (!data.data) {
        throw new Error("No product data in response");
      }
      return data.data;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`${this.baseUrl}/category/${category}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${category}`);
      }
      const data: ApiResponse<Product[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching category ${category}:`, error);
      throw error;
    }
  }
}

export const productService = new ProductService();
