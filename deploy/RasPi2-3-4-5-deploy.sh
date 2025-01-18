#!/bin/bash

set -e
set -x

git submodule update --init --recursive

## Raspi-Config - camera, serial port, ssh
#raspi-config nonint do_expand_rootfs
raspi-config nonint do_camera 0
raspi-config nonint do_ssh 0

# Increase swap size to 1024MB if it is currently less than 1000MB
# Allows the NPM build to complete successfully on systems with 500MB of RAM
if [ $(stat -c%s "/var/swap") -le 1000000000 ]; then
    echo "Swap file is less than 1000MB. Increasing to 1024MB."
    dphys-swapfile swapoff
    sed -i '/CONF_SWAPSIZE=.*/c\CONF_SWAPSIZE=1024' /etc/dphys-swapfile
    dphys-swapfile setup
    dphys-swapfile swapon
else
    echo "Swapfile is already >1000MB"
fi

## Pi5 uses a different UART for the 40-pin header (/dev/ttyAMA0)
# See https://forums.raspberrypi.com/viewtopic.php?t=359132
if [ -e "/proc/device-tree/compatible" ]; then
    if grep -q "5-model-bbrcm" "/proc/device-tree/compatible"; then
        echo "dtparam=uart0=on" | tee -a /boot/config.txt >/dev/null
    else
        # Enable serial, disable console
        raspi-config nonint do_serial 2
    fi
fi

## Change hostname
raspi-config nonint do_hostname rpanion
perl -pe 's/raspberrypi/rpanion/' -i /etc/hosts

./install_common_libraries.sh

## Only install picamera2 on RaspiOS
apt -y install python3-picamera2 python3-libcamera python3-kms++

systemctl disable dnsmasq
systemctl enable NetworkManager

apt install -y ca-certificates curl gnupg
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

apt update
apt install -y nodejs

## Configure nmcli to not need sudo
sed -i.bak -e '/^\[main\]/aauth-polkit=false' /etc/NetworkManager/NetworkManager.conf

## mavlink-router
./build_mavlinkrouter.sh

## and build & run Rpanion
./build_rpanion.sh

## For wireguard. Must be installed last as it messes the DNS resolutions
apt install -y resolvconf

reboot
