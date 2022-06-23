FROM linuxserver/code-server

ARG GOLANG_VERSION=1.16.15
ENV GOROOT /usr/local/go
ENV GOPATH /var/local/go
ENV PATH $PATH:$GOROOT/bin:$GOPATH/bin
ENV GO111MODULE on
ENV GOPROXY https://goproxy.cn

RUN \
    echo "**** install tools ****" && \
    apt-get update && \
    apt-get install -y \
    build-essential \
    libssl-dev libcurl4-openssl-dev libbz2-dev libjpeg-dev libpng-dev libgmp-dev libicu-dev libmcrypt-dev freetds-dev libxslt-dev libcurl3-dev autoconf dpkg-dev file g++ gcc libc-dev make pkg-config re2c \
    iputils-ping xinetd telnetd wget curl

RUN echo "**** install golang ****" && \
    GO_TGZ=go$(echo "$GOLANG_VERSION").linux-amd64.tar.gz && \
    wget https://golang.org/dl/${GO_TGZ} && \
    tar zxvf ${GO_TGZ} && \
    rm -rf ${GO_TGZ} && \
    mv go /usr/local

RUN chmod -R g+w /usr/local/go /var/local/go


RUN echo "**** go get for vscode ****" && \
    go get -v golang.org/x/tools/gopls && \
    go get -v github.com/ramya-rao-a/go-outline && \
    # go get github.com/uudashr/gopkgs/cmd/gopkgs@latest && \
    go get -v github.com/cweill/gotests/gotests && \
    go get -v github.com/fatih/gomodifytags && \
    go get -v github.com/josharian/impl && \
    go get -v github.com/haya14busa/goplay/cmd/goplay && \
    go get -v github.com/go-delve/delve/cmd/dlv && \
    go get -v honnef.co/go/tools && \
    go get -v golang.org/x/tools/gopls



RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
RUN rm -rf setup_14.*
RUN apt-get install -y nodejs
RUN chmod -R g+w /usr/lib/node_modules
RUN npm i -g yarn node-gyp


RUN apt-get clean
RUN rm -rf /tmp/* /var/lib/apt/lists/* /var/tmp/* 

ADD data /config/data
ADD extensions /config/extensions

EXPOSE 8443