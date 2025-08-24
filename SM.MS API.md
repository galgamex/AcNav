Basic
SM.MS API exposes the infrastructure via a standardized programmatic interface.

The API is accessed by making HTTPS requests to a specific version endpoint URL, in which GET, POST, PUT, PATCH, and DELETE methods dictate how your interact with the information available. Every endpoint is accessed only via the SSL-enabled HTTPS (port 443) protocol.

The stable base URL for all Version 2 HTTPS endpoints is:

https://sm.ms/api/v2/
Authentication
Authenticate requests by setting the Authorization header with a valid API key.

We accept just the API key:

 "Authorization": "14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf"
or Basic type and the API key:

"Authorization": "Basic 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf"
Make sure you've stored your API key somewhere secure and never share them publicly.

User
User - Get API-Token
post
/token
参数
字段	类型	描述
username	String	
Username/Email Address

password	String	
Success 200
字段	类型	描述
data	Object	
data.

success	Boolean	
Request status.

code	String	
Request status code.

RequestId	String	
Request ID.

message	String	
Message.

  token	String	
API Token.

Success-Response:
{
    "success": true,
    "code": "success",
    "message": "Get API token success.",
    "data": {
        "token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    },
    "RequestId": "8DCED45B-5E9F-43B1-90C6-29D562F250D5"
}
User - Get User Profile
post
/profile
Header
字段	类型	描述
Content-Type	String	
默认值: multipart/form-data

Authorization	String	
Success 200
字段	类型	描述
data	Object	
data.

success	Boolean	
Request status.

code	String	
Request status code.

RequestId	String	
Request ID.

message	String	
Message.

  username	String	
Username.

  email	String	
Email.

  role	String	
User Group Name.

  group_expire	String	
User Group Expire Date.

  email_verified	Number	
Email Verification（0 for not verified， 1 for verified）.

  disk_usage	String	
Disk Usage.

  disk_usage_raw	Number	
Disk RAW Usage（Byte）.

  disk_limit	String	
Disk Limit.

  disk_limit_raw	Number	
Disk RAW Limit（Byte）.

Success-Response:
{
    "success": true,
    "code": "success",
    "message": "Get user profile success.",
    "data": {
        "username": "smms",
        "email": "",
        "role": "VIP",
        "group_expire": "0000-00-00",
        "email_verified": 0,
        "disk_usage": "2.58 MB",
        "disk_limit": "50.00 GB",
        "disk_usage_raw": 2706034,
        "disk_limit_raw": 53687091200
    },
    "RequestId": "33D9572F-06DE-4571-99E0-801D8DA2316A"
}
Image
Image - Clear IP Based Temporary Upload History
get
/clear
参数
字段	类型	描述
format	String	
Return Type: json or xml, the default value is json

Success 200
字段	类型	描述
success	Boolean	
Request status.

code	String	
Request status code.

message	String	
Message.

RequestId	String	
Request ID.

Success-Response:
{
    "success": true,
    "code": "success",
    "message": "Clear list success.",
    "data": [],
    "RequestId": "5E29C689-D3C2-4D1C-9313-1AB7D5F9E264"
}
Image - IP Based Temporary Upload History
get
/history
参数
字段	类型	描述
format	String	
Return Type: json or xml, the default value is json

Success 200
字段	类型	描述
success	Boolean	
Request status.

code	String	
Request status code.

message	String	
Message.

data	Object[]	
data Object.

  width	Number	
Width.

  height	Number	
Height.

  filename	String	
Filename.

  storename	String	
Store name.

  size	Number	
Image Size.

  path	String	
Image Path.

  hash	String	
Image Deletion HASH.

  url	String	
Image URL.

  delete	String	
Image Deletion Link.

  page	String	
Image Page Link.

RequestId	String	
Request ID.

Image - Image Deletion
get
/delete/:hash
参数
字段	类型	描述
hash	String	
Image Deletion Hash

format	String	
Return Type: json or xml, the default value is json

Success 200
字段	类型	描述
success	Boolean	
Request status.

code	String	
Request status code.

message	String	
Message.

RequestId	String	
Request ID.

Image - Upload History
get
/upload_history
Header
字段	类型	描述
Content-Type	String	
默认值: multipart/form-data

Authorization	String	
参数
字段	类型	描述
page	Number	
The page of upload list.

Success 200
字段	类型	描述
success	Boolean	
Request status.

code	String	
Request status code.

message	String	
Message.

data	Object[]	
data Object.

  width	Number	
Width.

  height	Number	
Height.

  filename	String	
Filename.

  storename	String	
Store name.

  size	Number	
Image Size.

  path	String	
Image Path.

  hash	String	
Image Deletion HASH.

  created_at	String	
Image upload timestamp.

  url	String	
Image URL.

  delete	String	
Image Deletion Link.

  page	String	
Image Page Link.

RequestId	String	
Request ID.

Success-Response:
{
    "success": true,
    "code": "success",
    "message": "Get list success.",
    "data": [
        {
            "file_id": 0,
            "width": 4677,
            "height": 3307,
            "filename": "luo.jpg",
            "storename": "D5VpWCKFElUsPcR.jpg",
            "size": 801933,
            "path": "/2019/12/16/D5VpWCKFElUsPcR.jpg",
            "hash": "Q6vLIbCGZojrMhO2e7BmgFuXRV",
            "created_at": 1564844329,
            "url": "https://i.loli.net/2019/12/16/D5VpWCKFElUsPcR.jpg",
            "delete": "https://sm.ms/delete/Q6vLIbCGZojrMhO2e7BmgFuXRV",
            "page": "https://sm.ms/image/D5VpWCKFElUsPcR"
        }
    ],
    "RequestId": "8A84DDCA-96B3-4363-B5DF-524E95A5201A"
}
Image - Upload Image
post
/upload
Header
字段	类型	描述
Content-Type	String	
默认值: multipart/form-data

Authorization	String	
参数
字段	类型	描述
smfile	file	
format	String	
Return Type: json or xml, the default value is json

Success 200
字段	类型	描述
data	Object	
data.

success	Boolean	
Request status.

code	String	
Request status code.

RequestId	String	
Request ID.

message	String	
Message.

  width	Number	
Width.

  height	Number	
Height.

  filename	String	
Filename.

  storename	String	
Store name.

  size	Number	
Image Size.

  path	String	
Image Path.

  hash	String	
Image Deletion HASH.

  url	String	
Image URL.

  delete	String	
Image Deletion Link.

  page	String	
Image Page Link.

Success-Response:
{
    "success": true,
    "code": "success",
    "message": "Upload success.",
    "data": {
        "file_id": 0,
        "width": 4677,
        "height": 3307,
        "filename": "luo.jpg",
        "storename": "D5VpWCKFElUsPcR.jpg",
        "size": 801933,
        "path": "/2019/12/16/D5VpWCKFElUsPcR.jpg",
        "hash": "Q6vLIbCGZojrMhO2e7BmgFuXRV",
        "url": "https://vip1.loli.net/2019/12/16/D5VpWCKFElUsPcR.jpg",
        "delete": "https://sm.ms/delete/Q6vLIbCGZojrMhO2e7BmgFuXRV",
        "page": "https://sm.ms/image/D5VpWCKFElUsPcR"
    },
    "RequestId": "8A84DDCA-96B3-4363-B5DF-524E95A5201A"
}