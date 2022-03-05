// import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
//Base URL: 用這個改各方法需要的URL
const apiPath = 'ttest';  //自己的api_path

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

configure({
    generateMessage: localize('zh_TW'),
});

const app = Vue.createApp({
    data() {
        return {
            cartData: {
                carts: []   //清空購物車才可以用disabled
            },
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                    message: '',
                },
            },
            products: [],
            productId: '',
            isLoadingItem: '', //新增讀取效果
        };
    },
    components: {
        VForm: Form,
        VField: Field,
        ErrorMessage,
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
                })
                .catch((err) => {
                    console.log(err.data);
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
        removeCartItems() {
            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
                .then(() => {
                    this.getCart();
                })
                .catch((err) => {
                    console.log(err);
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
        createOrder() {
            const url = `${apiUrl}/api/${apiPath}/order`;
            const order = this.form;
            axios.post(url, { data: order }).then((response) => {
                alert(response.data.message);
                this.$refs.form.resetForm();
                this.form.message = "";
                this.getCart();
            }).catch((err) => {
                alert(err.data.message);
            });
        },
    },
    mounted() {
        this.getProducts();
        this.getCart();
    }
});

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
        closeModal() {
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
            console.log(typeof (this.qty));
            this.$emit('add-cart', this.product.id, this.qty);
        },
    },
    mounted() {
        this.modal = new bootstrap.Modal(this.$refs.modal);
    },
});


app.mount('#app');


