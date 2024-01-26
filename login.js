const { createApp } = Vue;
const app = createApp({
    data(){
        return{
            user : {
                username :"",
                password : "",
            }
        }
    },
    methods: {
        login(){
            const apiUrl = 'https://vue3-course-api.hexschool.io/v2/admin/signin';
            axios.post(apiUrl, this.user)
                //若登入成功，就會執行 .then 的內容，
              .then((res)=>{
                // 寫入 cookie 的token
                // 使用 expired 設置有效時間
                const {token, expired} = res.data;
                 //console.log(new Date(expired));
                 //https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
                 //myToken為自訂，可自行更改
                 document.cookie = `myToken=${token}; expires=${new Date(expired)}; path=/`;
                 window.location = 'index.html';
              })
              .catch((err) =>{
                console.log(err);
                alert(err.data.message);
              })
        }
    },
});
app.mount('#app');