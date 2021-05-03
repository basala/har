#!/bin/bash

#version
vv=$(date '+%Y-%m-%d-%H-%M')

#删除历史镜像
docker rmi har-test
echo "镜像删除完成"

# 构建新镜像
docker build -t har-test .
echo "镜像构建完成"

#将镜像推送到Registry，tag标记为当前年-月-日
sudo docker tag har-test swr.cn-east-3.myhuaweicloud.com/qfx/har-test:${vv}
sudo docker push swr.cn-east-3.myhuaweicloud.com/qfx/har-test:${vv}
echo "镜像上传完成"

#删除镜像
docker rmi swr.cn-east-3.myhuaweicloud.com/qfx/har-test:${vv}
echo "仓库镜像删除完成"
