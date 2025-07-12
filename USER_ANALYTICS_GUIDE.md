# User Analytics & Tracking System Guide

## Overview

This guide covers the comprehensive user analytics and tracking system implemented in the NaveDhana e-commerce platform. The system tracks user behavior, spending patterns, page analytics, and provides detailed insights for business intelligence.

## Features

### 📊 Core Tracking Capabilities

- **Page Visit Analytics**: Track which pages users visit most, session duration, bounce rate
- **Product Interaction Tracking**: Monitor product views, likes, shares, and category preferences
- **Cart Behavior Analysis**: Track add-to-cart actions, cart abandonment, conversion rates
- **Search Analytics**: Monitor search queries, results, and click-through rates
- **Order & Spending Patterns**: Comprehensive order history and spending behavior analysis
- **User Engagement Scoring**: Calculate engagement and loyalty scores
- **Customer Lifecycle Tracking**: Identify customer stages (new, developing, VIP, etc.)

### 🎯 Enhanced Users Dashboard

The Users component (`src/pages/admin/dashboard/components/Users.jsx`) provides:

- **Real-time Analytics Summary Cards**: Total revenue, orders, page views, average engagement
- **Enhanced Table View**: Shows page analytics, spending patterns, and engagement scores
- **Detailed User Modal**: Drill-down analytics with multiple tabs (Overview, Spending, Pages, Timeline)
- **Export Functionality**: Download user analytics as CSV
- **Advanced Filtering**: Filter by status, customer type, orders, and sort by multiple criteria

## Implementation

### 1. User Tracking Utility (`src/utils/userTracking.js`)

```javascript
import { trackPageVisit, trackProductInteraction, trackCartAction } from '../utils/userTracking';

// Track page visit
trackPageVisit(userId, {
  page: 'home',
  sessionDuration: 30000,
  referrer: document.referrer
});

// Track product interaction
trackProductInteraction(userId, {
  productId: 'prod123',
  productName: 'Fresh Tomatoes',
  category: 'Vegetables',
  price: 50,
  action: 'view'
});

// Track cart action
trackCartAction(userId, {
  action: 'add',
  productId: 'prod123',
  quantity: 2,
  price: 50
});
```

### 2. React Hook (`src/hooks/useUserTracking.js`)

```javascript
import { useUserTracking } from '../hooks/useUserTracking';

function MyComponent() {
  const { trackPage, trackProduct, trackCart, isUserLoggedIn } = useUserTracking();

  useEffect(() => {
    trackPage('products');
  }, []);

  const handleProductClick = (product) => {
    trackProduct(product, 'view');
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product) => {
    trackCart('add', product, 1);
    // ... add to cart logic
  };

  return (
    // ... component JSX
  );
}
```

### 3. Enhanced Context Integration

The tracking system is integrated with the existing `myState.jsx` context:

```javascript
// Enhanced tracking functions in context
trackUserActivity(userId, 'page_visit', {
  page: 'checkout',
  sessionDuration: 45000
});

trackSpendingPattern(userId, {
  amount: 250,
  category: 'Vegetables',
  orderId: 'order123'
});

trackPageAnalytics(userId, {
  page: 'products',
  timeSpent: 30000,
  isEntry: true
});
```

## Data Structure

### User Analytics Data Schema

```javascript
{
  // Basic Info
  pageVisits: 25,
  totalOrders: 3,
  totalSpent: 750,
  lastVisit: "2024-01-15 10:30:00",
  
  // Page Analytics
  pageBreakdown: {
    home: 8,
    products: 12,
    cart: 3,
    checkout: 2,
    profile: 0,
    other: 0
  },
  avgSessionDuration: 120000,
  singlePageVisits: 2,
  bounceRate: 8.0,
  
  // Product Interactions
  productViews: 45,
  viewHistory: [
    {
      productId: "prod123",
      productName: "Fresh Tomatoes",
      category: "Vegetables",
      price: 50,
      timestamp: "2024-01-15 10:30:00",
      action: "view"
    }
  ],
  categoryPreferences: {
    "Vegetables": 15,
    "Leafy Vegetables": 8,
    "Fruits": 3
  },
  
  // Cart Analytics
  cartActions: 8,
  cartHistory: [
    {
      action: "add",
      productId: "prod123",
      quantity: 2,
      price: 50,
      timestamp: "2024-01-15 10:30:00"
    }
  ],
  cartAbandonmentCount: 1,
  cartToCheckoutConversions: 2,
  
  // Spending Patterns
  spendingPattern: {
    monthlySpending: {
      "2024-01": 250,
      "2024-02": 300
    },
    categorySpending: {
      "Vegetables": 400,
      "Leafy Vegetables": 150
    },
    averageOrderValue: 166.67
  },
  
  // Customer Analytics
  customerLifecycleStage: "developing_customer",
  engagementScore: 75,
  loyaltyScore: 65,
  
  // Search Analytics
  searchQueries: 5,
  searchHistory: [
    {
      query: "fresh tomatoes",
      results: 12,
      clicked: true,
      clickedProduct: "prod123",
      timestamp: "2024-01-15 10:30:00"
    }
  ]
}
```

## Analytics Calculations

### 1. Engagement Score (0-100)
- **Page Visits** (0-25 points): visits × 2
- **Orders** (0-30 points): orders × 5  
- **Spending** (0-25 points): totalSpent ÷ 100
- **Recency** (0-20 points): Based on last visit

### 2. Customer Lifecycle Stages
- **New Customer**: First order
- **Developing Customer**: 2-3 orders
- **Established Customer**: 4-10 orders, ₹1000+ spent
- **VIP Customer**: 10+ orders, ₹5000+ spent
- **Loyal Customer**: 365+ days active, 5+ orders

### 3. Spending Frequency
- **Very High**: 4+ orders/month
- **High**: 2+ orders/month
- **Medium**: 1+ order/month
- **Low**: 0.5+ orders/month
- **Very Low**: <0.5 orders/month

## Using the Enhanced Users Dashboard

### 1. Analytics Summary Cards
View real-time metrics:
- Total Revenue across all users
- Total Orders placed
- Total Page Views
- Average Engagement Score

### 2. Enhanced Table View
Each user row shows:
- **User Info**: Name, ID, join date
- **Contact**: Email, phone, address
- **Page Analytics**: Total visits, top page, bounce rate
- **Spending Pattern**: Total spent, average order, frequency, trend
- **Engagement**: Score, level, status, customer type

### 3. Detailed User Modal
Click the eye icon to view detailed analytics:
- **Overview**: Basic info and engagement score
- **Spending**: Total spent, orders, average order value
- **Page Analytics**: Page visit breakdown and analytics
- **Timeline**: Activity timeline with key events

### 4. Export & Filtering
- **Export**: Download CSV with all user analytics
- **Refresh**: Update analytics data
- **Filters**: Status, customer type, orders, search
- **Sorting**: Name, date, orders, spending, visits

## Best Practices

### 1. Privacy & Performance
- Only track authenticated users
- Implement tracking throttling for high-frequency events
- Store aggregated data, not sensitive personal information
- Regularly clean old tracking data

### 2. Implementation Guidelines
```javascript
// Good: Use the hook for clean code
const { trackProduct } = useUserTracking();
trackProduct(product, 'view');

// Good: Include relevant context
trackCart('add', product, quantity, {
  source: 'product_page',
  recommended: false
});

// Good: Handle errors gracefully
try {
  await trackOrder(orderData);
} catch (error) {
  console.error('Tracking failed:', error);
  // Continue with business logic
}
```

### 3. Analytics Insights
- Monitor bounce rates to improve page experience
- Track category preferences for personalized recommendations
- Use engagement scores for targeted marketing
- Analyze spending patterns for inventory planning

## Integration Examples

### 1. Product Page Tracking
```javascript
// src/pages/productInfo/ProductInfo.jsx
useEffect(() => {
  trackPage('product_detail');
  trackProduct(product, 'view');
}, [product]);
```

### 2. Search Results Tracking
```javascript
// src/components/search/SearchResults.jsx
const handleSearch = async (query) => {
  const results = await searchProducts(query);
  trackSearch(query, results.length);
  setResults(results);
};
```

### 3. Order Completion Tracking
```javascript
// src/pages/checkout/OrderSuccess.jsx
useEffect(() => {
  trackOrder({
    orderId: order.id,
    amount: order.total,
    items: order.items,
    paymentMethod: order.paymentMethod
  });
  trackEngagement('order_completed', order.total);
}, [order]);
```

## Troubleshooting

### Common Issues

1. **Tracking not working**
   - Check if user is logged in
   - Verify Firebase permissions
   - Check browser console for errors

2. **Data not showing in dashboard**
   - Refresh the analytics data
   - Check if getUserData is being called
   - Verify Firestore rules

3. **Performance issues**
   - Implement tracking debouncing
   - Use batch updates for multiple events
   - Consider background tracking

### Debug Mode
Enable debug logging:
```javascript
// Add to localStorage
localStorage.setItem('analytics_debug', 'true');
```

## Future Enhancements

- Real-time analytics dashboard
- Machine learning recommendations
- A/B testing framework
- Advanced segmentation
- Predictive analytics
- Custom event tracking
- Funnel analysis
- Cohort analysis

---

This comprehensive tracking system provides valuable insights into user behavior, helping optimize the e-commerce experience and drive business growth. 