# nextjs-blog
This is the source of my website， [kongpf8848.com](https://kongpf8848.com).
## run
```
yarn
yarn dev
```
## build
```
docker build . --platform linux/amd64 -t nextjs-blog:v0.1
```

## deploy
```
docker run  -p 5000:3000 -d nextjs-blog:v0.1
```
