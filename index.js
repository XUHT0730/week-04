const { createApp } = Vue;
// const modal = document.querySelector('#showModal');
// 1. 將 Bootstrap modal 實體化
// https://getbootstrap.com/docs/5.0/components/modal/#usage
// const myModal = new bootstrap.Modal(modal);
let myModal = null;
let deleteModal = null;
//const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
//const apiPath = 'hedy-api-path';

const app = createApp({
    data() {
        return {
            apiUrl : 'https://vue3-course-api.hexschool.io/v2',
            apiPath : 'hedy-api-path',
            products : [],
            pagination : {},
            // isNew 用於判斷當前 Modal 是新增或編輯 Modal
            isNew : false,
            /*tempProduct: {} 裡面還有 imagesUrl: [] 只是預先定義，避免取值出錯，
            如果確定不會出錯，不寫也可以*/
            tempProduct: {
                imagesUrl: []
            }
        }
    },
    methods: {
        //驗證登入狀態
        checkLogin(){
            const checkLoginUrl = `${this.apiUrl}/api/user/check`;
            axios.post(checkLoginUrl)
             .then(()=>{
                //console.log('驗證成功');
                alert('驗證成功 歡迎光臨 ~');
                this.getProducts();
             })
             .catch((err)=>{
                alert(err.response.data.message);
                window.location = 'login.html';
             })
        },
        //取得產品資料
        // 參數 page = 1 代表的是預設當前頁碼為 1，
        getProducts(page = 1){
            // products?page=${page} 是用網址參數寫法，將 page 參數帶入，取得當前頁碼
            // https://support.google.com/google-ads/answer/6277564?hl=zh-Hant
            const getProductsUrl = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;
            axios.get(getProductsUrl)
             .then((res)=>{
                const { products, pagination } = res.data;
                this.pagination = pagination;
                this.products = products;
             })
             .catch((err)=>{
                alert(err.response.data.message);
                window.location = 'login.html';
             })
        },
        /*status 用於判斷當前點擊的是 新增/編輯/刪除 btn
          item 代表的是當前點擊的產品資料*/
        openModal(status, item){
            /* 用 if 判斷，若 status 為 ‘new’
               表示點擊的是新增按鈕，所以清空當前的 tempProduct 內容
               並將 isNew 的值改為 true，最後再開啟 myModal */
            if(status === 'new'){
                this.tempProduct = {
                    imagesUrl:[],
                };
                this.isNew = true;
                // 套用 modal.show() 方法開啟 model
                myModal.show();
            }
              /*若 status 為 ‘edit’，表示點擊到編輯按鈕，
                所以使用展開運算子 `…item` 將當前產品資料傳入 tempProduct，
                再將 isNew 的值改為 false，最後開啟 myModal */
            else if(status === 'edit'){
                this.tempProduct = {...item};
                this.isNew = false;
                myModal.show();
            }
              /* 若 status 為 ‘delete’，表示點擊到刪除按鈕，
                同樣使用展開運算子將產品資料傳入 tempProduct，
                用意是後續串接刪除 API 時，需要取得該產品的 id，
                最後開啟 deleteModel*/
            else if (status === 'delete'){
                this.tempProduct = {...item};
                deleteModal.show();
            }
        },
    },
    // 生命週期，在畫面完全生成之後，再來重新擷取動元素
    mounted() {
            //mounted 將 token 取出，並直接設定到 axios 的預設內容中，
            //這種寫法可以不用在每次發送請求時重複帶入 token 這段
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/,"$1",
              );
             // 夾帶 token 在 header 中，只要加入一次就可以重複使用
            //https://axios-http.com/zh/docs/config_defaults
            axios.defaults.headers.common['Authorization'] = token;
            // 觸發確認是否登入
            this.checkLogin();
    },
});

/*建立分頁元件，定義一個名為 pagination 的原件*/
app.component('pagination', {
    /*第一個 li 利用 :class 動態屬性的寫法，讓特定的 class 能根據資料變化來動態顯示移除
    {'disabled':pages.current_page === 1} 判斷當前頁碼是否在第一頁，是的話就顯示 disabled 樣式，禁止點擊上一頁按鈕
    <a> 用來觸發上一頁的按鈕，changePage(pages.current_page - 1) 表示取得當前頁碼再 - 1 頁的產品資料，進而取得上一頁資料 */
    /*第二個 li 是用於渲染所有頁碼
      利用 v-for 遍歷 pages.total_pages 總頁碼 
      利用 :class 動態屬性的寫法，判斷 item 是否與當前頁碼相同
      若相同就顯示 active 樣式，讓使用者得知自己目前處於第幾頁
      裡面的 <a> 標籤則是直接代入 item 執行 changePage(item)，取得當前頁碼的產品資料*/
    /*第三個 li 就是下一頁的功能，
        基本上與上一頁寫法相同
        只需調整 :class="{'disabled' : pages.current_page === pages.total_pages}"
         changePage 代入的參數調整成 changePage(pages.current_page + 1)
       */
    template : `
    <nav aria-label="Page navigation example">
            <ul class="pagination">
              <li 
                class="page-item" 
                :class="{'disabled' : pages.current_page === 1}"
              >
                <a 
                  class="page-link" href="#" 
                  @click.prevent="changePage(pages.current_page - 1)"  
                  aria-label="Previous"
                >
                   <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li 
                v-for="(item, index) in pages.total_pages" :key="index"
                class="page-item" 
                :class="{'active':item === pages.current_page}"
               >
                  <a 
                    class="page-link" 
                    href="#" 
                    @click.prevent="changePage(item)"
                  >{{ item }}</a>
              </li>
              <li 
                class="page-item" 
                :class="{'disabled' : pages.current_page === pages.total_pages}"
              >
                  <a 
                    class="page-link" 
                    href="#" 
                    @click.prevent="changePage(pages.current_page + 1)"  
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </a>
              </li>
            </ul>
          </nav>`,
          /* 利用 props 將 pagination 資料傳入子元件
             並將 template 內的 pagination 都取代為 pages*/
          props: ['pages'],
          /* 透過 emit 自定事件將子元件資料傳遞給根元件的 getProducts
             定義一個 changePage 函式，當觸發函式時就會執行自定義的 emit 事件
             帶入 num 參數，對應當前頁數 
             並將 template 內的 getProduct 都取代為 changePage*/
          methods: {
            changePage(num){
                this.$emit('change-page', num);
            }
          },
});
// 產品新增 / 編輯元件
app.component('myModal',{
    template : '#myModal',
    props : ['product','isNew'],
     data(){
         return{
             apiUrl: 'https://vue3-course-api.hexschool.io/v2',
             apiPath: 'hedy-api-path',
         };
     },
    methods : {
        // 新增 OR 編輯產品
        updateProduct(){
            //編輯產品
           let updateProductUrl = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.product.id}`;
           let http = 'put';

           //新增產品
           if (this.isNew){
              updateProductUrl = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
              http = 'post';
           }
           axios[http](updateProductUrl,{ data: this.product })
            .then((res)=>{
                alert(res.data.message);
                this.closeModal();
                //this.getProducts();  // 取得所有產品的函式，重新取得所有產品資料，完成產品更新
                this.$emit('update');
            })
            .catch((err)=>{
                alert(err.response.data.message);
            });
        },
        // 關閉 modal
        closeModal(){
            // 套用 modal.hide() 方法關閉 model
            myModal.hide();
        },
        /*createImages() 的 imagesUrl = [] 
        是避免在編輯產品時如果沒有 imagesUrl 屬性去執行接下來的 push 而出錯
        push('') 是用來新增一個空的 input 讓使用者可以填寫要新增的圖片網址 */
        createImages(){
            this.product.imagesUrl = [];
            this.product.imagesUrl.push('');
        }, 
        // 顯示 modal
        showModal(){
            myModal.show();
        }
    },
    mounted() {
        myModal = new bootstrap.Modal(document.getElementById('myModal'),{
            // 禁止使用者使用 ESC 鍵關閉互動視窗
            keyboard: false,
            // 禁止使用者點擊 modal 以外的地方來關閉視窗，避免資料輸入到一半遺失
            backdrop: 'static'
        });
    },
});
// 產品刪除元件
app.component('deleteModal',{
    template : '#deleteModal',
    props : ['item'],
    data() {
        return {
            apiUrl : 'https://vue3-course-api.hexschool.io/v2',
            apiPath : 'hedy-api-path',
        };
      },
    methods: {
        // 刪除產品
        delProduct(){
            const delProductUrl = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.item.id}`;
            axios.delete(delProductUrl)
             .then((res)=>{
                alert(res.data.message);
                this.closeModal();
                //this.getProducts();
                this.$emit('update');
             })
             .catch((err)=>{
                alert(err.response.data.message);
             })
        },
        // 顯示 modal
        showModal(){
            deleteModal.show();
        },
         // 關閉 modal
        closeModal(){
           deleteModal.hide();
        },

    },
    mounted(){
        deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'),{
            keyboard: false,
            backdrop: 'static'
       });
    },
});

app.mount('#app');
