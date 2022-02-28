import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
//Base URL: 用這個改各方法需要的URL
const apiPath = 'ttest';  //自己的api_path

const app = createApp({
    data() {
        return {
            cartData: {},
            products: [],
            productId: '',
            isLoadingItem: '', //新增讀取效果
        }
    },
    methods: {
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then((res) => {
                    this.products = res.data.products;
                });
        },
        openProductModal(id) {
            this.productId = id;
            this.$refs.productModal.openModal();
        },
        getCart() {
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
                .then((res) => {
                    this.cartData = res.data.data;
                });
        },
        addToCart(id, qty = 1) {
            const data = {
                product_id: id,
                qty,
            };
            this.isLoadingItem = id;
            axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
                .then((res) => {
                    console.log(res);
                    this.getCart();
                    this.$refs.productModal.closeModal();
                    // 做完即關閉視窗
                    this.isLoadingItem = '';
                });
        },
        removeCartItem(id) {
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
                .then((res) => {
                    this.getCart();
                    this.isLoadingItem = '';
                });
        },
        updateCart(item) {
            const data = {
                product_id: item.product.id,
                qty: item.qty,
            };
            this.isLoadingItem = item.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
                .then((res) => {
                    console.log(res);
                    this.getCart();
                    this.isLoadingItem = '';
                });
        },
    },
    mounted() {
        this.getProducts();
        this.getCart();
    }
})

//註冊一個productModal的元件, 用refs
app.component('product-modal', {
    props: ['id'],
    template: '#userProductModal',
    data() {
        return {
            modal: {},
            product: {},
            qty: 1,
        };
    },
    watch: {
        id() {
            this.getProduct();
        },
    },
    methods: {
        openModal() {
            this.modal.show();
        },
        closeModal(){
            this.modal.hide();
        },
        getProduct() {
            axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
                .then((res) => {
                    console.log(res);
                    this.product = res.data.product;
                });
        },
        addToCart() {
            console.log(this.qty);
            this.$emit('add-cart', this.product.id, this.qty);
        },
    },
    mounted() {
        this.modal = new bootstrap.Modal(this.$refs.modal);
    },
});

app.mount('#app');
