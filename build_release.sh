#! /bin/bash

env=$(git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')
if [ -z "$env" ]
then
    stage="Dev"
else
    if [ $env = "master" ]
    then
        stage="Prod"
    elif [ $env="stage" ]
    then 
        stage="Stage"
    else
        stage="Dev"
    fi
fi
echo "building for ${stage} enviroment"
sam build --profile default --parameter-overrides DeployEnvironment=${stage}
if [ $? -ne 0 ] 
then 
    echo "Aborting script due to build fail"
fi
sam deploy --profile default --no-confirm-changeset --parameter-overrides DeployEnvironment=${stage}
