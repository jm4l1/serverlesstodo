
const tableName = process.env.TODOS_TABLE;
const  uuid = require('uuid');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const makeResponse = (statusCode, message, data =[] ) =>{
    return({
        statusCode,
        body :JSON.stringify({
            message,
            data
        })
    });
};
exports.createTaskHandler = async(event) =>{
    const { body } = event;
    const { name } = JSON.parse(body);
    if(!name){
        return makeResponse(400,"name parameter is required to create task");
    }
    const date = new Date().toLocaleDateString();
    const params = {
        TableName : tableName,
        Item: { 
                id : uuid.v4(), 
                name: name,
                createdAt : date,
                updatedAt : date
            }
    };
    try{
        await docClient.put(params).promise();
        return makeResponse(200,"Task created");
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
exports.readTaskHandler = async(event) =>{
    const { pathParameters : {id} } =event;
    var params = {
        TableName : tableName,
        Key: { 
            id: id 
        },
    };
    try{
        const data = await docClient.get(params).promise();
        const {Item} = data;
        if(!Item){
            const body = {
                message : "Task Not Found.",
                data : []
            };
            return makeResponse(400,"Task Not Found.");
        }
        return makeResponse(200,"Task retreived.",[{...Item}]);
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
exports.readTasksHandler = async(event) =>{
    var params = {
        TableName : tableName
    };
    try{
        const data = await docClient.scan(params).promise();
        const items = data.Items;
        return makeResponse(200,"Tasks retrieved.",items);
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
// exports.updateTasksHandler = async(event) =>{
//     var params = {
//         TableName : tableName
//     };
//     const data = await docClient.scan(params).promise();
//     const items = data.Items;

//     const response = {
//         statusCode: 200,
//         body: JSON.stringify(items)
//     };
// };
// exports.deleteTaskHandler = async(event) =>{
//     var params = {
//         TableName : tableName
//     };
//     const data = await docClient.scan(params).promise();
//     const items = data.Items;

//     const response = {
//         statusCode: 200,
//         body: JSON.stringify(items)
//     };
// };
