
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
    if(!body){
        return makeResponse(400,"name parameter is required to create task");
    }
    const { name } = JSON.parse(body);
    if(!name){
        return makeResponse(400,"name parameter is required to create task");
    }
    const date = new Date().toLocaleDateString();
    const createParams = {
        TableName : tableName,
        Item: { 
                id : uuid.v4(), 
                name: name,
                completed : false,
                createdAt : date,
                updatedAt : date
            }
    };
    try{
        await docClient.put(createParams).promise();
        return makeResponse(200,"Task created");
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
exports.readTaskHandler = async(event) =>{
    const { pathParameters : {id} } =event;
    var readParams = {
        TableName : tableName,
        Key: { id },
    };
    try{
        const data = await docClient.get(readParams).promise();
        const {Item} = data;
        if(!Item){
            const body = {
                message : "Task Not Found.",
                data : []
            };
            return makeResponse(404,"Task Not Found.");
        }
        return makeResponse(200,"Task retreived.",[{...Item}]);
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
exports.readTasksHandler = async(event) =>{
    var readParams = {
        TableName : tableName
    };
    try{
        const data = await docClient.scan(readParams).promise();
        const items = data.Items;
        return makeResponse(200,"Tasks retrieved.",items);
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
exports.updateTaskHandler = async(event) =>{
    const { pathParameters : {id}  , body} =event;
    var readParams = {
        TableName : tableName,
        Key: { id },
    };
    try{
        const data = await docClient.get(readParams).promise();
        const {Item} = data;
        if(!Item){
            const body = {
                message : "Task Not Found.",
                data : []
            };
            return makeResponse(404,"Task Not Found.");
        }
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
    if(!body){
        return makeResponse(400,"One of name or completed parameter is required to update a task");
    }

    const { name , completed } = JSON.parse(body);
    if(!name && !completed){
        return makeResponse(400,"One of name or completed parameter is required to update a task");
    }
    let expressionAttributeValues = {};
    let expressionAttributeNames= {};
    let updateExpression = [];
    const attrs = {name , completed};
    Object.keys(attrs).map((attribute)=>{
        if((attrs[attribute] != undefined) || (attrs[attribute] !== null)){
            expressionAttributeNames[`#${attribute}`]=attribute;
            expressionAttributeValues[`:${attribute}`]= attrs[attribute];
            updateExpression.push(`#${attribute} = :${attribute}`);   
        }
    });
    updateExpression = "set " + updateExpression.join(",");
    try{
        var updateParams = {
            Key : { id },
            TableName : tableName,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames
        };
        const data = await docClient.update(updateParams).promise();
        console.log(data);
        return makeResponse(200,"Task Updated.");
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
exports.deleteTaskHandler = async (event) =>{
    const { pathParameters : {id} } =event;
    var deleteParams = {
        TableName : tableName,
        Key: { id },
    };
    try{
        const data = await docClient.delete(deleteParams).promise();
        return makeResponse(200,"Task Deleted.");
    }
    catch(err){
        console.log(err);
        return makeResponse(500,"An Error Occured During the Operation.");
    }
};
