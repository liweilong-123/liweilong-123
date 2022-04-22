const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        // 请求中有api1的都会调用代理
        proxy('/api1', {
            target: 'http://localhost:5000',
            changeOrigin: true, // 控制服务器收到的请求头中host字段的值（ip+端口）， 服务器那边知道是哪个端口过来的
            pathRewrite: {'^/api1':''} // 到对应服务端后悔将api2替换为空串， 重写请求路径
        }),
        proxy('/api2', {
            target: 'http://localhost:5001',
            changeOrigin: true,
            pathRewrite: {'^/api2':''}
        })
    )
}