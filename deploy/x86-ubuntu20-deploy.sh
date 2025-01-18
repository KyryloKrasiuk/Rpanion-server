#!/bin/bash

set -e
set -x

git submodule update --init --recursive

echo "export PATH=$PATH:$HOME/.local/bin" >> ~/.bashrc

## Need to temp disable this
systemctl stop unattended-upgrades.service

## Remove this to disable the "Pending Kernel Upgrade" message
# apt -y remove needrestart

./install_common_libraries.sh
apt install -y wireless-tools

systemctl disable dnsmasq

apt-get install -y ca-certificates curl gnupg
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

apt update
apt install -y nodejs


## Configure nmcli to not need sudo
sed -i.bak -e '/^\[main\]/aauth-polkit=false' /etc/NetworkManager/NetworkManager.conf

## Ensure nmcli can manage all network devices
touch /etc/NetworkManager/conf.d/10-globally-managed-devices.conf
echo "[keyfile]" | tee -a /etc/NetworkManager/conf.d/10-globally-managed-devices.conf >/dev/null
echo "unmanaged-devices=*,except:type:wifi,except:type:gsm,except:type:cdma,except:type:wwan,except:type:ethernet,type:vlan" | tee -a /etc/NetworkManager/conf.d/10-globally-managed-devices.conf >/dev/null
service network-manager restart

## mavlink-router
./build_mavlinkrouter.sh

## and build & run Rpanion
./build_rpanion.sh

## For wireguard. Must be installed last as it messes the DNS resolutions
apt install -y resolvconf

## And re-enable
systemctl start unattended-upgrades.service
