sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller,MessageToast) => {
    "use strict";

    return Controller.extend("odatacrud.controller.View1", {
        onInit() {
            this.oModel=this.getOwnerComponent().getModel()
            this.oProducts=this.getOwnerComponent().getModel("Products")
            
            this.readData()
            this.oProducts.setProperty("/Stock",[
                {
                "sKey":"avail",
                "sValue":"Available"
            },{
                "sKey":"na",
                "sValue":"Unavailable"
            }])
            this.setDefaultForm()
        },
        setDefaultForm:function(e){
            this.oProducts.setProperty("/formData",{
                "NAME":"",
                "ID":"",
                "QTY":"",
                "STOCK":"",
                "PRICE":""
            })
        },
        onAddSave:function(e){
            var oData=this.oProducts.getProperty("/formData")
            
            if(oData.sValue==="avail"){
                oData.STOCK="Available"
            }
            else if(oData.sValue==="na"){
                oData.STOCK="Unavailable"
            }
            delete oData.sValue
            
            var status="OK"
            var fields=["ID","NAME","QTY","PRICE","STOCK"]
            fields.forEach((id,index)=>{
                var field=sap.ui.getCore().byId(id)
                var val=field.getValue();
                
                field.setValueState(sap.ui.core.ValueState.Error)
                if(val!==""){
                    field.setValueState(sap.ui.core.ValueState.Success)
                    fields[index]="OK"
                }
            })
            fields.forEach((val)=>{
                if(val!=="OK"){
                    status="ERROR"
                    return;
                }
            })
            
            
            if(status==="OK"){
                oData.ID=parseInt(oData.ID);
                
                
                this.oModel.create("/Products",oData,{
                    success:(e)=>{
                        this.readData()
                        this.frag.close()
                        this.frag.destroy()
                        this.frag=null
                        
                        
                        this.setDefaultForm()
                    },
                    error:(e)=>{
                        debugger
                    }
                })
                
            }
            
            
        },
        onAddCancel:function(e){
            this.setDefaultForm()
            this.readData()
            this.frag.close()
            this.frag.destroy()
            this.frag=null
        },
        onAdd:function(e){
            if(!this.frag){
                this.frag=sap.ui.xmlfragment("odatacrud.fragments.AddData",this)
                this.getView().addDependent(this.frag)
            }
            this.frag.open()
        },
        onChange:function(e){
            // this.id=this.oProducts.getProperty(e.getSource().getSelectedContextPaths()[0]).ID
            this.id=e.getSource().getSelectedContexts()[0].getObject().ID
        },
        onDelete:function(e){
            var path="/Products("+this.id+")"
            this.oModel.remove(path,{
                success:()=>{
                    this.readData()
                    debugger
                },
                error:()=>{
                    debugger
                }
            })
        },
        readData:function(){
            this.oModel.read('/Products',{
                success:(data,res)=>{
                    debugger
                    this.oProducts.setProperty("/Products",data.results)
                    this.oProducts.getProperty("/Products").forEach(e => { 
                        e.editMode = false;
                     });
                    this.oProducts.refresh()
                },
                error:(err)=>{
                    debugger
                }
            })
        },
        onEdit:function(e){
            this.mode = e.getSource().getBindingContext('Products') + "/editMode"
            var modeValue = this.oProducts.getProperty(this.mode)
            if (modeValue) {
                this.oProducts.setProperty(this.mode, false)
            }
            else {
                this.oProducts.setProperty(this.mode, true)
            }
        },
        onSave:function(e){
            var sPath=e.getSource().getBindingContext('Products').sPath
            var oData=this.oProducts.getProperty(sPath);
            // oData.ID=parseInt(oData.ID)
            if(oData.sValue){
                if(oData.sValue === "avail"){
                    this.oProducts.setProperty(sPath+"/STOCK","Available");
                }
                else{
                    this.oProducts.setProperty(sPath+"/STOCK","Unavailable");
                }
                delete oData.sValue
                
                
            }
            delete oData.editMode
            var id=oData.ID;
            var path="/Products("+id+")"
            this.oModel.update(path,oData,{
                success:(e)=>{
                    this.oProducts.setProperty(this.mode,false)
                    this.readData()
                },
                error:(e)=>{
                }
            })
        },
        onCancel:function(e){
            this.readData()
            this.oProducts.setProperty(this.mode,false);
        }
    });
});