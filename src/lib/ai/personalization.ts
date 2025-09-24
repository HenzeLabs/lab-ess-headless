import { Product, UserProfile } from '../../types/product';

export interface PersonalizationOptions {
  userId?: string;
  sessionId: string;
  context: {
    currentPage?: string;
    currentProduct?: string;
    cartItems?: string[];
    recentlyViewed?: string[];
  };
  limit?: number;
}

export interface RecommendationResult {
  product: Product;
  score: number;
  reason: string;
  category: 'trending' | 'similar' | 'complementary' | 'personal' | 'seasonal';
}

export interface PersonalizationResponse {
  recommendations: RecommendationResult[];
  personalizedContent: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    categories: string[];
    promotions: string[];
  };
}

class PersonalizationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private seasonalTrends: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSeasonalTrends();
  }

  private initializeSeasonalTrends() {
    // Set seasonal product recommendations
    this.seasonalTrends.set('winter', [
      'coats',
      'boots',
      'sweaters',
      'scarves',
      'warm accessories',
    ]);
    this.seasonalTrends.set('spring', [
      'light jackets',
      'sneakers',
      'dresses',
      'light tops',
    ]);
    this.seasonalTrends.set('summer', [
      'shorts',
      'sandals',
      'swimwear',
      't-shirts',
      'sunglasses',
    ]);
    this.seasonalTrends.set('fall', [
      'jackets',
      'jeans',
      'boots',
      'layers',
      'warm colors',
    ]);
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if ([11, 0, 1].includes(month)) return 'winter';
    if ([2, 3, 4].includes(month)) return 'spring';
    if ([5, 6, 7].includes(month)) return 'summer';
    return 'fall';
  }

  private getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  private updateUserProfile(userId: string, activity: Partial<UserProfile>) {
    const existing = this.userProfiles.get(userId) || {
      id: userId,
      preferences: {
        categories: [],
        priceRange: { min: 0, max: 1000 },
        brands: [],
      },
      history: {
        purchases: [],
        views: [],
        searches: [],
      },
    };

    // Merge activity data
    if (activity.history) {
      existing.history = {
        ...existing.history,
        ...activity.history,
      };
    }

    if (activity.preferences) {
      existing.preferences = {
        ...existing.preferences,
        ...activity.preferences,
      };
    }

    this.userProfiles.set(userId, existing);
  }

  private calculateProductSimilarity(
    product1: Product,
    product2: Product,
  ): number {
    let similarity = 0;

    // Category similarity
    const categories1 =
      product1.collections?.map((c) => c.title.toLowerCase()) || [];
    const categories2 =
      product2.collections?.map((c) => c.title.toLowerCase()) || [];
    const categoryOverlap = categories1.filter((c) =>
      categories2.includes(c),
    ).length;
    const categoryUnion = [...new Set([...categories1, ...categories2])].length;
    similarity += (categoryOverlap / Math.max(categoryUnion, 1)) * 40;

    // Price similarity
    const price1 = parseFloat(product1.priceRange.minVariantPrice.amount);
    const price2 = parseFloat(product2.priceRange.minVariantPrice.amount);
    const priceDiff = Math.abs(price1 - price2);
    const avgPrice = (price1 + price2) / 2;
    similarity += Math.max(0, 1 - priceDiff / avgPrice) * 30;

    // Brand similarity
    if (
      product1.vendor &&
      product2.vendor &&
      product1.vendor === product2.vendor
    ) {
      similarity += 30;
    }

    // Tags similarity
    const tags1 = product1.tags?.map((t) => t.toLowerCase()) || [];
    const tags2 = product2.tags?.map((t) => t.toLowerCase()) || [];
    const tagOverlap = tags1.filter((t) => tags2.includes(t)).length;
    const tagUnion = [...new Set([...tags1, ...tags2])].length;
    similarity += (tagOverlap / Math.max(tagUnion, 1)) * 20;

    return similarity;
  }

  private findSimilarProducts(
    productId: string,
    products: Product[],
    limit: number = 5,
  ): Product[] {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return [];

    const similarities = products
      .filter((p) => p.id !== productId)
      .map((product) => ({
        product,
        similarity: this.calculateProductSimilarity(targetProduct, product),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities.map((s) => s.product);
  }

  private getComplementaryProducts(
    product: Product,
    products: Product[],
  ): Product[] {
    // Define complementary product rules
    const complementaryRules = new Map<string, string[]>([
      ['shirt', ['pants', 'jeans', 'shorts', 'accessories']],
      ['dress', ['shoes', 'accessories', 'jacket', 'cardigan']],
      ['pants', ['shirt', 'top', 'shoes', 'belt']],
      ['shoes', ['socks', 'accessories', 'polish', 'laces']],
      ['jacket', ['shirt', 'pants', 'accessories']],
    ]);

    const productCategories =
      product.collections?.map((c) => c.title.toLowerCase()) || [];
    const productTags = product.tags?.map((t) => t.toLowerCase()) || [];

    let complementaryCategories: string[] = [];

    // Find complementary categories based on rules
    [...productCategories, ...productTags].forEach((category) => {
      const complements = complementaryRules.get(category);
      if (complements) {
        complementaryCategories = [...complementaryCategories, ...complements];
      }
    });

    // Find products in complementary categories
    return products
      .filter((p) => {
        const pCategories =
          p.collections?.map((c) => c.title.toLowerCase()) || [];
        const pTags = p.tags?.map((t) => t.toLowerCase()) || [];
        return [...pCategories, ...pTags].some((cat) =>
          complementaryCategories.includes(cat),
        );
      })
      .slice(0, 4);
  }

  private getPersonalizedRecommendations(
    userProfile: UserProfile,
    products: Product[],
    limit: number,
  ): RecommendationResult[] {
    const recommendations: RecommendationResult[] = [];

    // Filter by user preferences
    const filteredProducts = products.filter((product) => {
      const price = parseFloat(product.priceRange.minVariantPrice.amount);
      const priceInRange =
        price >= userProfile.preferences.priceRange.min &&
        price <= userProfile.preferences.priceRange.max;

      const categoryMatch =
        userProfile.preferences.categories.length === 0 ||
        product.collections?.some((collection) =>
          userProfile.preferences.categories.includes(collection.title),
        );

      const brandMatch =
        userProfile.preferences.brands.length === 0 ||
        userProfile.preferences.brands.includes(product.vendor || '');

      return priceInRange && (categoryMatch || brandMatch);
    });

    // Score products based on user history
    filteredProducts.forEach((product) => {
      let score = 0;
      let reason = 'Matches your preferences';

      // Viewed similar products
      const viewedCategories = userProfile.history.views
        .map((viewedId) => products.find((p) => p.id === viewedId))
        .filter(Boolean)
        .flatMap((p) => p!.collections?.map((c) => c.title) || []);

      const productCategories = product.collections?.map((c) => c.title) || [];
      const categoryMatch = productCategories.some((cat) =>
        viewedCategories.includes(cat),
      );

      if (categoryMatch) {
        score += 50;
        reason = "Similar to items you've viewed";
      }

      // Purchase history similarity
      const purchasedCategories = userProfile.history.purchases
        .map((purchaseId) => products.find((p) => p.id === purchaseId))
        .filter(Boolean)
        .flatMap((p) => p!.collections?.map((c) => c.title) || []);

      const purchaseMatch = productCategories.some((cat) =>
        purchasedCategories.includes(cat),
      );

      if (purchaseMatch) {
        score += 70;
        reason = 'Similar to your previous purchases';
      }

      // Brand preference
      if (userProfile.preferences.brands.includes(product.vendor || '')) {
        score += 30;
        reason = 'From a brand you like';
      }

      if (score > 0) {
        recommendations.push({
          product,
          score,
          reason,
          category: 'personal',
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private getTrendingRecommendations(
    products: Product[],
    limit: number,
  ): RecommendationResult[] {
    // In a real app, this would come from analytics data
    // For now, simulate trending products
    const trending = products
      .filter((product) => {
        // Simple heuristic: newer products or those with keywords suggesting popularity
        const hasPopularKeywords =
          product.title.toLowerCase().includes('bestseller') ||
          product.title.toLowerCase().includes('popular') ||
          product.title.toLowerCase().includes('trending');

        const isRelativelyNew =
          product.createdAt &&
          new Date(product.createdAt) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

        return hasPopularKeywords || isRelativelyNew;
      })
      .slice(0, limit);

    return trending.map((product) => ({
      product,
      score: 75,
      reason: 'Trending now',
      category: 'trending' as const,
    }));
  }

  private getSeasonalRecommendations(
    products: Product[],
    limit: number,
  ): RecommendationResult[] {
    const currentSeason = this.getCurrentSeason();
    const seasonalKeywords = this.seasonalTrends.get(currentSeason) || [];

    const seasonalProducts = products
      .filter((product) => {
        const title = product.title.toLowerCase();
        const tags = product.tags?.map((t) => t.toLowerCase()) || [];
        const categories =
          product.collections?.map((c) => c.title.toLowerCase()) || [];

        return seasonalKeywords.some(
          (keyword) =>
            title.includes(keyword) ||
            tags.some((tag) => tag.includes(keyword)) ||
            categories.some((cat) => cat.includes(keyword)),
        );
      })
      .slice(0, limit);

    return seasonalProducts.map((product) => ({
      product,
      score: 60,
      reason: `Perfect for ${currentSeason}`,
      category: 'seasonal' as const,
    }));
  }

  generateRecommendations(
    products: Product[],
    options: PersonalizationOptions,
  ): PersonalizationResponse {
    const recommendations: RecommendationResult[] = [];
    const limit = options.limit || 12;

    // Get user profile if available
    const userProfile = options.userId
      ? this.getUserProfile(options.userId)
      : null;

    // Generate different types of recommendations
    if (userProfile) {
      const personalRecs = this.getPersonalizedRecommendations(
        userProfile,
        products,
        limit / 3,
      );
      recommendations.push(...personalRecs);
    }

    // Similar products if viewing a specific product
    if (options.context.currentProduct) {
      const similarProducts = this.findSimilarProducts(
        options.context.currentProduct,
        products,
        limit / 4,
      );

      recommendations.push(
        ...similarProducts.map((product) => ({
          product,
          score: 65,
          reason: 'Similar to current item',
          category: 'similar' as const,
        })),
      );

      // Complementary products
      const currentProduct = products.find(
        (p) => p.id === options.context.currentProduct,
      );
      if (currentProduct) {
        const complementary = this.getComplementaryProducts(
          currentProduct,
          products,
        );
        recommendations.push(
          ...complementary.map((product) => ({
            product,
            score: 55,
            reason: 'Goes well with current item',
            category: 'complementary' as const,
          })),
        );
      }
    }

    // Trending products
    const trending = this.getTrendingRecommendations(products, limit / 4);
    recommendations.push(...trending);

    // Seasonal recommendations
    const seasonal = this.getSeasonalRecommendations(products, limit / 4);
    recommendations.push(...seasonal);

    // Remove duplicates and sort by score
    const uniqueRecommendations = recommendations
      .filter(
        (rec, index, self) =>
          self.findIndex((r) => r.product.id === rec.product.id) === index,
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Generate personalized content
    const personalizedContent = this.generatePersonalizedContent(userProfile);

    return {
      recommendations: uniqueRecommendations,
      personalizedContent,
    };
  }

  private generatePersonalizedContent(userProfile: UserProfile | null) {
    const currentSeason = this.getCurrentSeason();

    let hero = {
      title: `Discover Your Perfect ${
        currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)
      } Style`,
      subtitle: 'Curated collections for the modern wardrobe',
      cta: 'Shop Now',
    };

    let categories = ['new-arrivals', 'bestsellers', 'sale'];
    let promotions = ['Free shipping on orders over $100'];

    if (userProfile) {
      // Personalize based on user preferences
      if (userProfile.preferences.categories.length > 0) {
        hero = {
          title: `Your Favorite ${userProfile.preferences.categories[0]} Collection`,
          subtitle: 'New arrivals in styles you love',
          cta: 'Explore Collection',
        };
        categories = userProfile.preferences.categories.slice(0, 3);
      }

      // Personalize promotions based on purchase history
      if (userProfile.history.purchases.length > 3) {
        promotions = [
          'VIP Member: Extra 15% off your next order',
          'Free shipping on orders over $75 (VIP)',
        ];
      }
    }

    return {
      hero,
      categories,
      promotions,
    };
  }

  // Public methods for tracking user behavior
  trackProductView(userId: string, productId: string, product: Product) {
    if (!userId) return;

    const profile = this.getUserProfile(userId) || {
      id: userId,
      preferences: {
        categories: [],
        priceRange: { min: 0, max: 1000 },
        brands: [],
      },
      history: {
        purchases: [],
        views: [],
        searches: [],
      },
    };

    // Add to view history (keep last 50 views)
    profile.history.views = [
      productId,
      ...profile.history.views.filter((id) => id !== productId),
    ].slice(0, 50);

    // Update category preferences based on views
    const categories = product.collections?.map((c) => c.title) || [];
    categories.forEach((category) => {
      if (!profile.preferences.categories.includes(category)) {
        profile.preferences.categories.push(category);
      }
    });

    // Update brand preferences
    if (
      product.vendor &&
      !profile.preferences.brands.includes(product.vendor)
    ) {
      profile.preferences.brands.push(product.vendor);
    }

    this.updateUserProfile(userId, profile);
  }

  trackPurchase(userId: string, productIds: string[]) {
    if (!userId) return;

    this.updateUserProfile(userId, {
      history: {
        purchases: productIds,
        views: [],
        searches: [],
      },
    });
  }

  trackSearch(userId: string, query: string) {
    if (!userId) return;

    this.updateUserProfile(userId, {
      history: {
        searches: [query],
        purchases: [],
        views: [],
      },
    });
  }
}

export const personalizationEngine = new PersonalizationEngine();
