// Enhanced JavaScript for Free Palestine Restaurant - COMPLETE & FIXED
// Features: Cart management, animations, WhatsApp integration, and more

class FreePalestineRestaurant {
    constructor() {
        this.cart = [];
        this.isCartOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCartFromStorage();
        this.initScrollAnimations();
        this.initMenuFilter();
        this.addNewItemBadges();
        this.setupMobileMenu();
    }

    bindEvents() {
        // Cart icon click
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }

        // Close cart when clicking overlay
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeCart());
        }

        // Close cart with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isCartOpen) {
                this.closeCart();
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Add loading animation to CTA button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoading();
                setTimeout(() => {
                    this.hideLoading();
                    document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
                }, 800);
            });
        }
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            });

            // Close mobile menu when clicking links
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }
    }

    // Menu Filtering
    initMenuFilter() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        const menuItems = document.querySelectorAll('.menu-item');

        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const category = button.dataset.category;

                // Filter menu items
                menuItems.forEach(item => {
                    if (category === 'all' || item.dataset.category === category) {
                        item.style.display = 'block';
                        // Add animation
                        item.classList.add('animate-scale');
                        setTimeout(() => item.classList.add('is-visible'), 100);
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Cart Management - FIXED
    addToCart(itemName, price) {
        const existingItem = this.cart.find(item => item.name === itemName);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: itemName,
                price: price,
                quantity: 1,
                id: Date.now() + Math.random().toString(36).substr(2, 9)
            });
        }

        this.updateCartDisplay();
        this.saveCartToStorage();
        this.showNotification(`${itemName} added to cart!`, 'success');
        this.animateAddToCart(itemName);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCartDisplay();
        this.saveCartToStorage();
        this.showNotification('Item removed from cart', 'error');
    }

    updateQuantity(itemId, change) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += change;

            if (this.cart[itemIndex].quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                this.updateCartDisplay();
                this.saveCartToStorage();
            }
        }
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
        const totalPrice = document.getElementById('total-price');

        if (!cartItems || !cartCount || !totalPrice) return;

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items
        cartItems.innerHTML = '';

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                    <p>Your cart is empty</p>
                    <p style="color: var(--text-light); font-size: 0.9rem;">Add some delicious items to get started!</p>
                </div>
            `;
            totalPrice.textContent = '0';
            return;
        }

        let total = 0;

        this.cart.forEach(item => {
            total += item.price * item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    ${this.getItemEmoji(item.name)}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} EGP × ${item.quantity} = ${item.price * item.quantity} EGP</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="window.restaurant.updateQuantity('${item.id}', -1)">−</button>
                        <span style="margin: 0 0.5rem; font-weight: 600; min-width: 30px; text-align: center; display: inline-block;">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.restaurant.updateQuantity('${item.id}', 1)">+</button>
                        <button class="remove-item" onclick="window.restaurant.removeFromCart('${item.id}')" style="margin-left: auto;">🗑️</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        totalPrice.textContent = total;
    }

    getItemEmoji(itemName) {
        const emojiMap = {
            'Maqluba': '🍛',
            'Musakhan': '🍗',
            'Golden Pie': '🥮',
            'Kibbeh': '🥙',
            'Kaak': '🥨',
            'Maamoul': '🍪',
            'Stuffed Grape Leaves': '🍃',
            'Fried Fish': '🐟',
            'Grilled Fish': '🐠',
            'Chicken Pan with Thyme': '🍗',
            'Grilled Chicken': '🍗',
            'Pasta with Chicken Breast': '🍝',
            'Chicken with Onion and Lemon': '🍋',
            'Fatta Rice with Meat': '🍚',
            'Fatta Rice with Chicken': '🍚',
            'Fish Soup': '🍲',
            'Grilled Turkey Thigh': '🦃',
            'Molokhia with Rabbit': '🐇',
            'Hawawshi': '🥙',
            'Stuffed Pigeon': '🐦',
            'Couscous': '🌾',
            'Pumpkin Sweet with Honey': '🎃',
            'Vegetable Salad': '🥗',
            'Hummus': '🥣'
        };
        return emojiMap[itemName] || '🍽️';
    }

    // Cart UI
    toggleCart() {
        if (this.isCartOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');

        if (cartSidebar) cartSidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');

        this.isCartOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const overlay = document.querySelector('.overlay');

        if (cartSidebar) cartSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        this.isCartOpen = false;
        document.body.style.overflow = '';
    }

    // Storage
    saveCartToStorage() {
        try {
            localStorage.setItem('freePalestineCart', JSON.stringify(this.cart));
        } catch (e) {
            console.error('Error saving cart to storage:', e);
        }
    }

    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('freePalestineCart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
                this.updateCartDisplay();
            }
        } catch (e) {
            console.error('Error loading cart from storage:', e);
            this.cart = [];
        }
    }

    // Notifications
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('active'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }, 3000);
    }

    // Animations
    initScrollAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // Observe all animate elements
            document.querySelectorAll('.animate, .animate-right, .animate-scale').forEach(el => {
                observer.observe(el);
            });
        }
    }

    animateAddToCart(itemName) {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.1)';
            setTimeout(() => {
                cartIcon.style.transform = '';
            }, 300);

            // Add pulse animation to cart icon
            cartIcon.classList.add('pulse');
            setTimeout(() => cartIcon.classList.remove('pulse'), 600);
        }
    }

    addNewItemBadges() {
        // Mark new items
        const menuItems = document.querySelectorAll('.menu-item');
        const newItems = ['Couscous', 'Pumpkin Sweet with Honey', 'Grilled Turkey Thigh'];

        menuItems.forEach(item => {
            const itemNameElement = item.querySelector('h3');
            if (itemNameElement) {
                const itemName = itemNameElement.textContent;
                if (newItems.includes(itemName)) {
                    const badge = document.createElement('div');
                    badge.className = 'new-badge';
                    badge.textContent = 'NEW';
                    badge.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: var(--gradient-primary);
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        font-size: 0.75rem;
                        font-weight: 700;
                        z-index: 10;
                    `;
                    item.style.position = 'relative';
                    item.appendChild(badge);

                    // Add pulse animation to add to cart button
                    const addButton = item.querySelector('.add-to-cart');
                    if (addButton) {
                        addButton.classList.add('new');
                    }
                }
            }
        });
    }

    // Checkout via WhatsApp - UPDATED to use modal
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        if (window.checkoutModal) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            window.checkoutModal.open(this.cart, total);
        } else {
            // Fallback to direct WhatsApp
            this.processDirectWhatsApp();
        }
    }

    processDirectWhatsApp() {
        this.showLoading();

        // Format order message
        let message = `*New Order from Free Palestine Restaurant*%0A%0A`;
        message += `*Order Details:*%0A`;

        this.cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} - ${item.quantity} × ${item.price} EGP%0A`;
        });

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `%0A*Total: ${total} EGP*%0A%0A`;
        message += `*Please provide:*%0A`;
        message += `- Name%0A`;
        message += `- Address%0A`;
        message += `- Phone%0A`;
        message += `- Special Instructions%0A%0A`;
        message += `*Thank you for choosing Free Palestine! 🍽️🇵🇸*`;

        const phoneNumber = '+201279102786';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        // Simulate processing delay
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Redirecting to WhatsApp...', 'success');

            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                // Clear cart after successful order
                this.cart = [];
                this.updateCartDisplay();
                this.saveCartToStorage();
                this.closeCart();
            }, 1000);
        }, 1500);
    }

    // Loading states
    showLoading() {
        let spinner = document.querySelector('.loading-spinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            document.body.appendChild(spinner);
        }
        spinner.style.display = 'block';
        document.body.style.cursor = 'wait';
    }

    hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
        document.body.style.cursor = '';
    }

    // Utility functions
    scrollToMenu() {
        const menuSection = document.querySelector('#menu');
        if (menuSection) {
            menuSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Enhanced Checkout Modal System - COMPLETE & FIXED
class CheckoutModal {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        // Remove existing modal if any
        const existingModal = document.querySelector('.checkout-modal');
        if (existingModal) {
            existingModal.remove();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'checkout-modal';
        this.modal.innerHTML = `
            <div class="checkout-modal-content">
                <div class="checkout-header">
                    <h2>Complete Your Order</h2>
                    <button class="close-checkout-modal" type="button">&times;</button>
                </div>
                <div class="checkout-body">
                    <form id="checkout-form">
                        <div class="form-group">
                            <label for="customer-name">Full Name *</label>
                            <input type="text" id="customer-name" name="name" required placeholder="Enter your full name">
                            <div class="form-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="customer-phone">Phone Number *</label>
                            <input type="tel" id="customer-phone" name="phone" required placeholder="Enter your phone number">
                            <div class="form-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="customer-address">Delivery Address *</label>
                            <textarea id="customer-address" name="address" required placeholder="Enter your complete delivery address" rows="3"></textarea>
                            <div class="form-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="order-notes">Special Instructions (Optional)</label>
                            <textarea id="order-notes" name="notes" placeholder="Any special instructions for your order (spice level, allergies, etc.)" rows="3"></textarea>
                        </div>
                        
                        <div class="order-summary">
                            <h4>Order Summary</h4>
                            <div id="checkout-order-items"></div>
                            <div class="order-total">
                                <strong>Total: <span id="checkout-total-price">0</span> EGP</strong>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="checkout-footer">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="submit" form="checkout-form" class="confirm-order-btn">
                        <span class="btn-text">Complete Order via WhatsApp</span>
                        <span class="btn-loading" style="display: none;">
                            <div class="loading-spinner-small"></div>
                            Processing...
                        </span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
        this.addModalStyles();
    }

    addModalStyles() {
        const styleId = 'checkout-modal-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .checkout-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                z-index: 3000;
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: 20px;
                box-sizing: border-box;
            }

            .checkout-modal.active {
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 1;
            }

            .checkout-modal-content {
                background: white;
                border-radius: 20px;
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .checkout-modal.active .checkout-modal-content {
                transform: scale(1);
            }

            .checkout-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 2px solid #f0f0f0;
                background: linear-gradient(135deg, #2c3e50, #34495e);
                color: white;
                border-radius: 20px 20px 0 0;
            }

            .checkout-header h2 {
                margin: 0;
                font-size: 1.4rem;
                font-weight: 700;
            }

            .close-checkout-modal {
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .close-checkout-modal:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .checkout-body {
                padding: 1.5rem;
            }

            .form-group {
                margin-bottom: 1.5rem;
            }

            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #2c3e50;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 2px solid #e9e9e9;
                border-radius: 10px;
                font-size: 1rem;
                transition: all 0.3s ease;
                font-family: inherit;
                box-sizing: border-box;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #e67e22;
                box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
            }

            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }

            .order-summary {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 10px;
                margin-top: 1rem;
            }

            .order-summary h4 {
                margin: 0 0 1rem 0;
                color: #2c3e50;
                font-weight: 700;
            }

            #checkout-order-items {
                margin-bottom: 1rem;
            }

            .checkout-order-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid #e9e9e9;
            }

            .checkout-order-item:last-child {
                border-bottom: none;
            }

            .order-total {
                text-align: center;
                padding-top: 1rem;
                border-top: 2px solid #e67e22;
                font-size: 1.2rem;
            }

            .checkout-footer {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 2px solid #f0f0f0;
            }

            .cancel-btn {
                flex: 1;
                padding: 1rem;
                border: 2px solid #e74c3c;
                background: white;
                color: #e74c3c;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1rem;
            }

            .cancel-btn:hover {
                background: #e74c3c;
                color: white;
                transform: translateY(-2px);
            }

            .confirm-order-btn {
                flex: 2;
                padding: 1rem;
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 1rem;
            }

            .confirm-order-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(39, 174, 96, 0.3);
            }

            .confirm-order-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .loading-spinner-small {
                width: 16px;
                height: 16px;
                border: 2px solid transparent;
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .form-error {
                color: #e74c3c;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: none;
            }

            .form-group.error input,
            .form-group.error textarea,
            .form-group.error select {
                border-color: #e74c3c;
            }

            .form-group.error .form-error {
                display: block;
            }

            @media (max-width: 768px) {
                .checkout-modal {
                    padding: 10px;
                }
                
                .checkout-modal-content {
                    width: 95%;
                    margin: 0 auto;
                }

                .checkout-footer {
                    flex-direction: column;
                }

                .checkout-header h2 {
                    font-size: 1.2rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        // Close button
        const closeBtn = this.modal.querySelector('.close-checkout-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Cancel button
        const cancelBtn = this.modal.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        // Form submission
        const form = this.modal.querySelector('#checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processOrder();
            });
        }

        // Input validation
        this.setupValidation();
    }

    setupValidation() {
        const form = this.modal.querySelector('#checkout-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return false;

        let errorElement = formGroup.querySelector('.form-error');
        if (!errorElement) {
            errorElement = this.createErrorElement(formGroup);
        }

        if (!field.value.trim()) {
            this.setError(formGroup, 'This field is required');
            return false;
        }

        if (field.type === 'tel' && !this.validatePhone(field.value)) {
            this.setError(formGroup, 'Please enter a valid phone number');
            return false;
        }

        this.clearError(formGroup);
        return true;
    }

    validatePhone(phone) {
        const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    createErrorElement(formGroup) {
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        formGroup.appendChild(errorElement);
        return errorElement;
    }

    setError(formGroup, message) {
        formGroup.classList.add('error');
        const errorElement = formGroup.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError(formGroup) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    validateForm() {
        const form = this.modal.querySelector('#checkout-form');
        if (!form) return false;

        const requiredFields = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    open(cart, total) {
        if (cart.length === 0) {
            if (window.restaurant) {
                window.restaurant.showNotification('Your cart is empty!', 'error');
            }
            return;
        }

        this.updateOrderSummary(cart, total);
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus on first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('#customer-name');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form
        const form = this.modal.querySelector('#checkout-form');
        if (form) form.reset();

        // Clear errors
        this.modal.querySelectorAll('.form-group').forEach(group => {
            this.clearError(group);
        });
    }

    updateOrderSummary(cart, total) {
        const orderItemsContainer = this.modal.querySelector('#checkout-order-items');
        const totalPriceElement = this.modal.querySelector('#checkout-total-price');

        if (!orderItemsContainer || !totalPriceElement) return;

        orderItemsContainer.innerHTML = '';

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'checkout-order-item';
            itemElement.innerHTML = `
                <span>${item.name} × ${item.quantity}</span>
                <span>${item.price * item.quantity} EGP</span>
            `;
            orderItemsContainer.appendChild(itemElement);
        });

        totalPriceElement.textContent = total;
    }

    processOrder() {
        if (!this.validateForm()) {
            if (window.restaurant) {
                window.restaurant.showNotification('Please fill all required fields correctly', 'error');
            }
            return;
        }

        const form = this.modal.querySelector('#checkout-form');
        if (!form) return;

        const formData = new FormData(form);
        const orderData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            notes: formData.get('notes'),
            cart: window.restaurant ? window.restaurant.cart : [],
            total: window.restaurant ? window.restaurant.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0
        };

        this.showLoading(true);
        this.sendToWhatsApp(orderData);
    }

    sendToWhatsApp(orderData) {
        let message = `*NEW ORDER - Free Palestine Restaurant*%0A%0A`;

        // Customer Information
        message += `*🧔 Customer Information:*%0A`;
        message += `• Name: ${orderData.name}%0A`;
        message += `• Phone: ${orderData.phone}%0A`;
        message += `• Address: ${orderData.address}%0A`;
        if (orderData.notes) {
            message += `• Special Instructions: ${orderData.notes}%0A`;
        }
        message += `%0A`;

        // Order Details
        message += `*📦 Order Details:*%0A`;
        orderData.cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name}%0A`;
            message += `   Quantity: ${item.quantity}%0A`;
            message += `   Price: ${item.price} EGP × ${item.quantity} = ${item.price * item.quantity} EGP%0A%0A`;
        });

        // Order Summary
        message += `*💰 Order Summary:*%0A`;
        message += `• Subtotal: ${orderData.total} EGP%0A`;
        message += `• Delivery Fee: 15 EGP%0A`;
        const grandTotal = orderData.total + 15;
        message += `• *Grand Total: ${grandTotal} EGP*%0A%0A`;

        message += `*🕒 Order Time:* ${new Date().toLocaleString()}%0A%0A`;
        message += `*Thank you for choosing Free Palestine Restaurant! 🍽️🇵🇸*`;

        const phoneNumber = '+201279102786';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        // Simulate processing delay
        setTimeout(() => {
            this.showLoading(false);

            if (window.restaurant) {
                window.restaurant.showNotification('Order completed! Opening WhatsApp...', 'success');
            }

            setTimeout(() => {
                window.open(whatsappUrl, '_blank');

                // Clear cart and close modals
                if (window.restaurant) {
                    window.restaurant.cart = [];
                    window.restaurant.updateCartDisplay();
                    window.restaurant.saveCartToStorage();
                    window.restaurant.closeCart();
                }
                this.close();

                // Show success message
                setTimeout(() => {
                    if (window.restaurant) {
                        window.restaurant.showNotification('Order placed successfully! We will contact you soon.', 'success');
                    }
                }, 1000);

            }, 1500);
        }, 2000);
    }

    showLoading(show) {
        const confirmBtn = this.modal.querySelector('.confirm-order-btn');
        if (!confirmBtn) return;

        const btnText = confirmBtn.querySelector('.btn-text');
        const btnLoading = confirmBtn.querySelector('.btn-loading');

        if (show) {
            confirmBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
        } else {
            confirmBtn.disabled = false;
            if (btnText) btnText.style.display = 'block';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main restaurant class
    window.restaurant = new FreePalestineRestaurant();

    // Initialize checkout modal
    window.checkoutModal = new CheckoutModal();

    // Add essential CSS styles
    const essentialStyles = document.createElement('style');
    essentialStyles.textContent = `
        .pulse {
            animation: pulse 0.6s ease-in-out;
        }
        
        .empty-cart {
            text-align: center;
            padding: 2rem;
            color: var(--text-light);
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
        }
        
        .cart-item {
            transition: all 0.3s ease;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .quantity-btn {
            background: #f5f5f5;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
            transition: all 0.2s ease;
            min-width: 32px;
        }
        
        .quantity-btn:active {
            background: var(--primary-color);
            color: white;
            transform: scale(0.9);
        }
        
        .remove-item {
            background: none;
            border: none;
            color: var(--accent-color);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.2s ease;
            font-size: 1.1rem;
            min-width: 32px;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .remove-item:active {
            background: var(--accent-color);
            color: white;
            transform: scale(0.9);
        }
        
        .cart-item-info {
            flex: 1;
        }
        
        .cart-item-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
            font-size: 1rem;
        }
        
        .cart-item-price {
            color: var(--primary-color);
            font-weight: 700;
            font-size: 0.9rem;
        }

        .notification {
            position: fixed;
            top: 100px;
            right: 1rem;
            left: 1rem;
            background: var(--white);
            padding: 1rem;
            border-radius: 12px;
            box-shadow: var(--shadow-hover);
            border-left: 4px solid var(--primary-color);
            transform: translateY(-100px);
            transition: transform 0.3s ease;
            z-index: 3000;
            max-width: none;
        }

        .notification.active {
            transform: translateY(0);
        }

        .notification.success {
            border-left-color: #27ae60;
        }

        .notification.error {
            border-left-color: #e74c3c;
        }

        @media (min-width: 768px) {
            .notification {
                right: 30px;
                left: auto;
                max-width: 320px;
            }
        }
    `;
    document.head.appendChild(essentialStyles);
});

// Global functions for HTML onclick attributes
function addToCart(itemName, price) {
    if (window.restaurant) {
        window.restaurant.addToCart(itemName, price);
    }
}

function scrollToMenu() {
    if (window.restaurant) {
        window.restaurant.scrollToMenu();
    }
}

function closeCart() {
    if (window.restaurant) {
        window.restaurant.closeCart();
    }
}

function checkout() {
    if (window.restaurant) {
        window.restaurant.checkout();
    }
}