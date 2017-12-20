export PATH="$PATH:$PWD/node_modules/.bin"
sudo sysctl -w vm.max_map_count=262144
docker-compose up -d
