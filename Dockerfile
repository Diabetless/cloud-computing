FROM ubuntu:20.04

ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update \
  && apt-get install -y tzdata \
  && apt-get install -y python3.9 python3-pip python3.9-dev \
  build-essential gcc g++ make \
  curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_18.x | bash -s -- --skip-tzdata \
  && apt-get install -y nodejs

WORKDIR /app

COPY . .
COPY run.sh .

RUN npm install
RUN chmod +x /app/run.sh

RUN echo "Check Python, GCC, Make, and Node Version"
RUN python3 --version && gcc --version && make --version && node -v

ENV PORT 5000
EXPOSE 5000

ENTRYPOINT ["/app/run.sh"]

CMD ["/app/run.sh"]