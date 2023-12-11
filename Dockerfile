FROM ubuntu:20.04

RUN apt-get update \
  && apt-get install -y python3 python3-pip python3-dev \
  build-essential gcc g++ make \
  curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs

WORKDIR /app

COPY . .
COPY run.sh .

RUN npm install
RUN chmod +x /app/run.sh

RUN echo "Check Python, GCC, and Node Version"
RUN python3 --version && gcc --version && node -v

ENV PORT 5000
EXPOSE 5000 

ENTRYPOINT ["/app/run.sh"]

CMD ["/app/run.sh"]