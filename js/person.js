var Api="http://localhost:3020/";

new Vue({
    el:'#appPerson', 
    created:function(){
        this.showError(); 
    },
    data:{
        user:""
    },
    methods:{
        login : function(){
            axios.post(Api+"User/Login",{username:this.user})
            .then(function (response){
                location.href="board.html?userid="+response.data.Data[0];    
                
            }).catch(function (error) {
                sweetAlert(error);
            });
        },
        // We show an error if a user tries to access the board without logging in
        showError : function(){
            let urlParams = new URLSearchParams(window.location.search);
            let status = urlParams.get('status');
            if(status == 'error')
                sweetAlert("Oops...", "Please Login", "error");
        }
    }
});

