#!/bin/bash

result=""
NC='\033[0m' # No Color
RED='\033[0;31m'
YELLOW='\033[0;93m'
BLUE='\033[0;95m'

function log() {
	if [[ $2 == "error" ]];then
		result+="${RED}$1\tHATA\n"
	elif [[ $2 == "info" ]]; then
		result+="${BLUE}$1\tOK\n"
	else
		result+="${YELLOW}$1\tOK\n"
	fi
}


timedatectl set-timezone Europe/Istanbul

sudo apt -y update

sudo apt -y upgrade

sudo apt -y install ssh

## BAZI TEMEL UYGULAMALAR
sudo apt -y install mc
log "mc yuklendi"
sudo apt -y install zip
log "zip yuklendi"
sudo apt -y install curl
log "curl yuklendi"

sudo apt -y install speedtest-cli
log "speedtest-cli yuklendi"
## /BAZI TEMEL UYGULAMALAR

## DEFAULT FOLDERS

mkdir -p /temp
## chmod -R 777 /temp
log "/temp folder olusturuldu"

mkdir -p /apps
## chmod -R 777 /apps
log "/apps folder olusturuldu"

mkdir -p /mongodatabases
## chmod -R 777 /mongodatabases
log "/mongodatabases folder olusturuldu"

## /DEFAULT FOLDERS

## ANA UYGULAMALAR , php mysql phpmyadmin, nodejs mongodb
sudo apt -y install language-pack-en-base

sudo apt -y install mysql-server
log "mysql-server yuklendi"
sudo apt -y install software-properties-common
sudo LC_ALL=en_US.UTF-8 add-apt-repository ppa:ondrej/php -y
sudo apt -y update

sudo apt -y install php7.4
sudo apt -y install php-pear php7.4-curl php7.4-dev php7.4-gd php7.4-mbstring php7.4-zip php7.4-mysql php7.4-xml
sudo apt -y install php7.4-fpm
sudo apt -y install libapache2-mod-php7.4
sudo apt -y install libapache2-mod-fcgid
sudo apt -y install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt -y update
sudo apt -y install php7.4 php7.4-fpm

sudo update-alternatives --set php /usr/bin/php7.4
sudo a2enmod php7.4

sudo apt -y install composer
sudo a2enconf php7.4-fpm

log "php7.4 yuklendi"

sudo systemctl restart apache2
sudo apt -y install phpmyadmin apache2-utils
sudo phpenmod mbstring

log "phpmyadmin yuklendi"

sudo systemctl restart apache2

sudo apt -y update
sudo apt -y upgrade

sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates

sudo curl -sL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt -y install nodejs
sudo apt -y  install gcc g++ make

log "nodejs 17 yuklendi"


sudo rm /etc/default/locale
echo "LANG=en_US.UTF-8">>/etc/default/locale
echo "LANGUAGE=en_US">>/etc/default/locale
echo "LC_ALL=en_US.UTF-8">>/etc/default/locale

sudo rm /etc/apt/sources.list.d/mongo*.list
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

sudo apt -y update
sudo apt -y install mongodb-org

sudo chown -R mongodb:mongodb /mongodatabases
sudo rm /var/run/mongodb/mongod.pid
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock

## mongodb config file
str=`cat mongod.conf`
ara="  dbPath: /var/lib/mongodb"
yeni="  dbPath: /mongodatabases"

str="${str/$ara/$yeni}"

ara="  bindIp: 127.0.0.1"
yeni=$'  bindIp: 127.0.0.1\n  bindIpAll: true\n  ipv6: true'

str="${str/$ara/$yeni}"

echo "${str}">>/etc/mongod.conf

mkdir /var/run/mongodb

sudo systemctl enable mongod.service
sudo systemctl start mongod.service

## GUVENLIK
sudo apt -y install ufw
sudo ufw allow 22
sudo ufw allow 22123
sudo ufw allow 80
sudo ufw allow 443

## test serverda tum portlar acik kalmali
# sudo ufw enable

log "ufw kuruldu. portlar 22, 22123, 80, 443 ayarlandi."

## test serverda bloklama kaldiriliyor
# sudo apt -y install fail2ban



## /GUVENLIK


## SWAP DOSYA  4GB
sudo swapoff -a
sudo dd if=/dev/zero of=/swapfile bs=1G count=4
sudo chmod 600 /swapfile
sudo swapon /swapfile
grep SwapTotal /proc/meminfo


sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod ssl
sudo a2enmod proxy_ajp
sudo a2enmod proxy_balancer
sudo a2enmod proxy_fcgi
sudo a2enmod proxy_html
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod session
sudo a2enmod userdir
sudo a2enmod actions
sudo a2enmod cache


sudo hostnamectl set-hostname TEST-PESA
sudo npm -g update
sudo npm -g install pm2
sudo ln -s /etc/apache2/sites-available /apps/sia

sudo apt -y install net-tools
sudo apt -y install redis-server
sudo systemctl restart redis.service


log "INSTALLATION COMPLETED"

printf "\n\n${YELLOW}PHP version:\n"
php -v
printf "\n\n${YELLOW}NODEJS version:\t"
node --version
printf "\n\n${YELLOW}NPM version:\t"
npm --version
printf "\n\n${YELLOW}MONGODB version:\n"
mongod --version

printf "\n\n${YELLOW}REDIS version:\n"
redis-cli --version

printf "${NC}\n"

printf "$result\n${NC}"

