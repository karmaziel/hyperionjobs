//FUNCIÓN PARA GUARDAR Y BUSCAR NOMBRE Y OTROS ELEMENTOS

const Job = require("../model/Job");

var id_key;

try{
const data=await Job.find().toArray();
}
catch
{
    console.log(err);
}

/*function search()
{
    for(var i = 0; i < data.length; i++)
    {
        if(data[i]==)
    }
}*/