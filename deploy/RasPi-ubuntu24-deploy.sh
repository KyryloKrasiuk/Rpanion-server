#!/bin/bash

set -e
set -x

git submodule update --init --recursive

## Enable serial port
perl -pe 's/console=serial0,115200//' -i /boot/firmware/cmdline.txt

echo "export PATH=$PATH:$HOME/.local/bin" >> ~/.bashrc

## CSI Camera - not working for now (Ubuntu issue ... not fixable at my end)
#echo "" | tee -a /boot/firmware/config.txt >/dev/null
#echo "# Enable Camera" | tee -a /boot/firmware/config.txt >/dev/null
#echo "start_x=1" | tee -a /boot/firmware/config.txt >/dev/null
#echo "gpu_mem=128" | tee -a /boot/firmware/config.txt >/dev/null

## Need to temp disable this
systemctl stop unattended-upgrades.service

## Remove this to disable the "Pending Kernel Upgrade" message
apt -y remove needrestart

## Packages
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

## Need this to get eth0 working too
## From https://askubuntu.com/questions/1290471/ubuntu-ethernet-became-unmanaged-after-update
touch /etc/netplan/networkmanager.yaml
echo "network:" | tee -a /etc/netplan/networkmanager.yaml >/dev/null
echo "  version: 2" | tee -a /etc/netplan/networkmanager.yaml >/dev/null
echo "  renderer: NetworkManager" | tee -a /etc/netplan/networkmanager.yaml >/dev/null
netplan generate
netplan apply

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

## And re-enable
systemctl start unattended-upgrades.service

reboot
