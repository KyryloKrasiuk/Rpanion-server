#!/bin/bash

set -e
set -x

git submodule update --init --recursive

## Set permissions
adduser $USER dialout
systemctl disable nvgetty.service

## Packages
./install_common_libraries.sh

systemctl disable dnsmasq

apt-get install -y ca-certificates curl gnupg python3-netifaces nvidia-l4t-gstreamer
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
#Ubuntu 18 (Jetson) doesn't like modern nodejs
if [ "$ID" == "ubuntu" ] && [ "$VERSION_CODENAME" == "bionic" ]; then
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_16.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
else
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
fi


apt update
apt install -y nodejs

## Configure nmcli to not need sudo
sed -i.bak -e '/^\[main\]/aauth-polkit=false' /etc/NetworkManager/NetworkManager.conf

## Ensure nmcli can manage all network devices
touch /etc/NetworkManager/conf.d/10-globally-managed-devices.conf
echo "[keyfile]" | tee -a /etc/NetworkManager/conf.d/10-globally-managed-devices.conf >/dev/null
echo "unmanaged-devices=*,except:type:wifi,except:type:gsm,except:type:cdma,except:type:wwan,except:type:ethernet,type:vlan" | tee -a /etc/NetworkManager/conf.d/10-globally-managed-devices.conf >/dev/null
if systemctl list-units --full -all | grep -Fq 'network-manager.service'; then
    service network-manager restart
fi
if systemctl list-units --full -all | grep -Fq 'NetworkManager.service'; then
    service NetworkManager restart
fi

## mavlink-router
./build_mavlinkrouter.sh

## and build & run Rpanion
./build_rpanion.sh

## Need to run service as sudo
perl -pe 's/User=$ENV{SUDO_USER}/User=root/' -i /etc/systemd/system/rpanion.service
systemctl daemon-reload
systemctl restart rpanion.service

## For wireguard. Must be installed last as it messes the DNS resolutions
apt install -y resolvconf

reboot

