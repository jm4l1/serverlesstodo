
const tableName = process.env.TODOS_TABLE;
const  uuid = require('uuid');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

exports.createTaskHandler = async(event) =>{
    const { body } = event;
    const { name } = JSON.parse(body);
    let response = {};
    if(!name){
        response.statusCode = 400;
        response.body = JSON.stringify({
            message : "name parameter is required to create task",
            data : []
        });
        return response;
    }
    const params = {
        TableName : tableName,
        Item: { 
                id : uuid.v4(), 
                name: name 
            }
    };
    try{
        const data = await docClient.scan(params).promise();
        const items = data.Items;
        const body = {
            message : "Task created",
            data : items
        };
        response.statusCode = 200;
        response.body = JSON.stringify(body);
    }
    catch(err){
        console.log(err)
        const body = {
            message : "An Error Occured During the Operation.",
            data : []
        };
        response.statusCode = 500;
        response.body = JSON.stringify(body);
    }
    finally{
        return response;
    }
};
exports.readTaskHandler = async(event) =>{
    const { pathParameters : {id} } =event;
    var params = {
        TableName : tableName,
        Key: { id: id },
    };
    let response = {};
    try{
        const data = await docClient.get(params).promise();
        const items = data.Items;
        if(items.length == 0){
            const body = {
                message : "Task Not Found.",
                data : []
            };
            response.statusCode = 404;
            response.body = JSON.stringify(body);
            return response;
        }
    
        const body = {
            message : "Task created",
            data : [{...items}]
        };
        response.statusCode = 200;
        response.body = JSON.stringify(body);

        response = {
            statusCode: 200,
            body: JSON.stringify(items)
        };
    }
    catch(err){
        const body = {
            message : "An Error Occured During the Operation.",
            data : []
        };
        response.statusCode = 500;
        response.body = JSON.stringify(body);
    }
    finally{
        return response;
    }
};