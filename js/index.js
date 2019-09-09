var Api="http://localhost:3020/";

new Vue({
    el:'#appIndex',  
    created:function(){
        this.GetInfo()
    },
    data:{
        listUser:[],
        listShowTask:[],
        listTask:[],
        listState:[],
        listAllTask:[],
        countStatus:0,
        username:"",
        userid:0,
        newTask:"",
        descNewTask:"" ,
        newState:"",
        descNewState:"",
        modal:{
            task:{
                name:undefined,
                description:undefined,
                userid:undefined,
                stateid:undefined
            }
        }     
    },
    methods:{
        //Function used to load autocomplete and search for user data
        modifyTask: function(_task){
            $('.modal-trigger').leanModal();
            this.modal.task = _task;
            this.GetInfoUser(this.modal.task.userid);

              new Autocomplete('#autocompleteUser', {
                search: input => {
                    if (input.length < 1) { return "" }
                    let resUser = this.listUser.filter(user => {
                      return user.username.toLowerCase()
                        .startsWith(input.toLowerCase())
                    });
                    this.modal.task.userid = resUser[0]._id;
                    return resUser;
                },getResultValue: result => result.username
              });
        },
        //Function used to load all tasks and users
        GetInfo :  function(){       
                       
            axios.get(Api+"User").then(response =>{
                this.listUser = response.data.Data;
            });
            axios.get(Api+"Task").then(response =>{
                //get all the tasks of a user
                this.listAllTask = response.data.Data;
                //we identify tasks that have not been assigned a status
                this.listTask = [];
                this.listAllTask.forEach(element => {
                    if(element.stateid == ""){
                        this.listTask.push(element);
                    }
                });
            });
            axios.get(Api+"State/Group").then(response =>{
                this.listState =  response.data.Data;
                this.GenerateListShowTask(this.listState);
            }); 
                      
        }, 
        //Function used to create a new task      
        AddTask : function(){
            let task = {
                name:this.newTask,
                description:this.descNewTask,
                userid:undefined,
                stateid:""           
            };
            axios.post(Api+"Task",task).then(response =>{
                this.listTask.push(task);
            }).catch(err=>{
                swal("Error creating task", err.response.data.Data[0], "error");
            });
            this.newTask="";
            this.descNewTask="";
        },
        //Function used to delete a task
        RemoveTask : function(taskid){
            //We request customer confirmation
            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this task!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              })
              .then((willDelete) => {    
                  //If the confirmation is affirmative, we proceed to eliminate the task              
                if (willDelete) {
                    
                    axios.delete(Api+"Task/"+taskid,)
                    .then(response =>{
                        //Show a success message, and remove that task from the VueJS list [listShowTask and listTask]
                        swal("Your Task has been deleted!", { icon: "success",});
                        this.listShowTask.forEach((element,index)=>{
                            if(element._id ==taskid){
                                this.listShowTask.splice(index, 1);
                            }
                        });
                        
                        this.listTask.forEach((element,index)=>{
                            if(element._id ==taskid){
                                this.listTask.splice(index, 1);
                            }
                        });

                    }).catch(err=>{
                        swal("Error deleting task", err.response.data.Data[0], "error");
                    });
                }
              });
        },
        //Function used to create a new state       
        AddState : function(){
            let state = {
                name:this.newState,
                description:this.descNewState,
                userid:undefined    
            };

            axios.post(Api+"State",state).then(response =>{
                //We update the list of states, because when we add a new state,
                // we don't have the '_id' of that state
                this.GetAllState();
            }).catch(err=>{                
                swal("Error creating state", err.response.data.Data[0], "error");
            });
            this.newState="";
            this.descNewState="";
        },
        //Function used to change the status of a task
        ChangeState : function(task,_stateid=""){
            let _task = {
                name:task.name,
                description:task.description,
                userid:task.userid,
                stateid:_stateid           
            };
            axios.put(Api+"Task/TaskAssignState/"+task.name,_task).then(response =>{
                //We update the task list in the 'list Show Task' array of VueJs
                this.updateListShowTask(task.name,_task);
            }).catch(err=>{
                swal("Error updating status", err.response.data.Data[0], "error");
            });
        },
        //Function used to delete a state
        RemoveState : function(stateid){
             //We request customer confirmation
            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this State!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              })
              .then((willDelete) => {
                  //If the confirmation is affirmative, we proceed to eliminate the task
                if (willDelete) {
                    axios.delete(Api+"State/"+stateid,)
                    .then(response =>{
                        //Show a success message, and remove that task from the VueJS list [listShowTask and listTask]
                        swal("Your State has been deleted!", { icon: "success",});
                        this.listState.forEach((element,index)=>{
                            if(element._id ==stateid){
                                this.listState.splice(index, 1);
                            }
                        });

                    }).catch(err=>{
                        swal("Error deleting state", err.response.data.Data[0], "error");
                    });
                }
              });
        },
        //Function used to obtain all the states of a user
        GetAllState : function(){
            axios.get(Api+"State").then(response =>{
                this.listState =  response.data.Data;
            }); 
        },
        //Function used to designate a task a status
        AssignState : function(task,_stateid){            
            let _task = {
                name:task.name,
                description:task.description,
                userid:task.userid,
                stateid:_stateid           
            };

            axios.put(Api+"Task/TaskAssignState/"+task.name,_task).then(response =>{
                //We add this task to the list that will show 'listShowTask' 
                //and remove it from the list of tasks without assignment 'listTask'
                this.listShowTask.push(_task);
                this.listTask.forEach((element,index)=>{
                    if(element.name ==task.name){
                        this.listTask.splice(index, 1);
                    }
                });
            }).catch(err=>{
                swal("Error assign task", err.response.data.Data[0], "error");
            });
        },
        //Function used to obtain all the tasks of a specific state
        TaskFromState : function(stateid){          
            let list=[];
            this.listAllTask.forEach(element=>{
                if(element.stateid == stateid){
                    list.push(element);
                }
            });
            return list;
        },
        //Function used to generate the array 'listShowTask' 
        //and thus have the tasks that were already assigned to show them in their respective state
        GenerateListShowTask : function(listState){
            this.listShowTask = [];  //List of tasks to show on the board           
           listState.forEach(data=>{  //List of all states            
            this.listAllTask.forEach(element=>{ //List of all tasks
                if(element.stateid == data._id){
                    this.listShowTask.push(element);
                }
            });
           });            
        },
        //Function used to update the array 'list Show Task', when an action has been performed on it
        updateListShowTask : function(oldTaskName, newtask){
            this.listShowTask.forEach((element,index)=>{
                if(element.name ==oldTaskName){
                    this.listShowTask.splice(index, 1);
                    if(newtask.stateid == undefined || newtask.stateid ==""){
                        this.listTask.push(newtask);
                    }else{
                        this.listShowTask.push(newtask);                    
                    }                    
                }
            });
        },
        //Function used to reset the modal window data
        resetModal : function(){
            this.modal={
                task:{
                    name:undefined,
                    description:undefined,
                    userid:undefined,
                    stateid:undefined
                }
            };
            this.username="";
        },
        //Function used to designate a user a task
        AssignUser : function(){
            axios.put(Api+"Task/"+this.modal.task._id,this.modal.task).then(response =>{
                this.resetModal();
            }).catch(err=>{
                swal("Error assign task", err.response.data.Data[0], "error");
            });
        },
        //Function used to verify the UserID and obtain the tasks and states of a user
        GetInfoUser :  function(_id){ 
            axios.get(Api+"User?userid="+_id).then(response =>{
                this.username= response.data.Data[0].username;
            });      
        },
        //Function used to display the modal user administration window
        ShowModalUsers :function(){
            $('.modal-triggeruser').leanModal();
        },
        //Function used to create a new user
        AddUser : function(){
            axios.post(Api+"User",{username:this.username}).then(response =>{  
                this.resetModal();
                this.GetAllUser();
            }).catch(function (err) {
                swal("Error creating state", err.response.data.Data[0], "error");
            });
        },//Function used to obtain all the states of a user
        GetAllUser : function(){
            axios.get(Api+"User").then(response =>{
                this.listUser =  response.data.Data;
            }); 
        },
        //Function used to delete a user
        RemoveUser : function(userid){
          //We request customer confirmation
          swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this user!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {    
              //If the confirmation is affirmative, we proceed to eliminate the user              
            if (willDelete) {
                
                axios.delete(Api+"User/"+userid,)
                .then(response =>{
                    //Show a success message, and remove the user from the VueJS array [listUser]
                    swal("User deleted!", { icon: "success",});
                    this.listUser.forEach((element,index)=>{
                        if(element._id ==userid){
                            this.listUser.splice(index, 1);
                        }
                    });                
                }).catch(err=>{
                    swal("Error deleting the user", err.response.data.Data[0], "error");
                });
            }
          });  
        }
    }
});