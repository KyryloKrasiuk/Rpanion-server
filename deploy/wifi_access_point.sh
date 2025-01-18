#!/bin/bash

set -e
set -x

# this script sets up the wifi access point

# Create Access Point
APNAME="WiFiAP"
SSID="rpanion"
KEY="rpanion123"

IFNAME=wlan0
nmcli connection add type wifi ifname $IFNAME con-name $APNAME ssid $SSID
nmcli connection modify $APNAME 802-11-wireless.mode ap
nmcli connection modify $APNAME 802-11-wireless.band bg
nmcli connection modify $APNAME ipv4.method shared
nmcli connection modify $APNAME ipv4.addresses 10.0.2.100/24
# Set security
nmcli connection modify $APNAME 802-11-wireless-security.key-mgmt wpa-psk
nmcli connection modify $APNAME 802-11-wireless-security.psk "$KEY"
nmcli connection modify $APNAME 802-11-wireless-security.group ccmp
nmcli connection modify $APNAME 802-11-wireless-security.pairwise ccmp
# Disable WPS
nmcli connection modify $APNAME 802-11-wireless-security.wps-method 1

nmcli connection up $APNAME

