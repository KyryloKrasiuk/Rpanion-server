import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import basePage from './basePage.js'

class VPNPage extends basePage {
    constructor(props) {
        super(props)
        this.state = {
            ...this.state,
            statusZerotier: {installed: false, status: false, text: []},
            statusWireguard: {installed: false, status: false, text: []},
            statusNetBird: {installed: false, status: false, text: []},
            selectedVPN: {label: 'Zerotier', value: 'zerotier'},
            vpnOptions: [
                {label: 'Zerotier', value: 'zerotier'},
                {label: 'Wireguard', value: 'wireguard'},
                {label: 'NetBird', value: 'netbird'}
            ],
            selVPNInstalled: false,
            selVPNActive: false,
            newZerotierKey: "",
            selectedWGFile: '',
            selectedWGFileContents: null,
            newNetBirdSetupKey: "",
        }
    }

    componentDidMount() {
        // Fetch the vpn information and send to controls
        this.setState({loading: true});
        Promise.all([
            fetch(`/api/vpnzerotier`, {headers: {Authorization: `Bearer ${this.state.token}`}}).then(response => response.json()).then(state => {
                this.setState(state);
            }),
            fetch(`/api/vpnwireguard`, {headers: {Authorization: `Bearer ${this.state.token}`}}).then(response => response.json()).then(state => {
                this.setState(state);
            }),
            this.requestNetBirdInfo(),
        ]).then(this.loadDone());
    }

    handlenewZerotierKey = (event) => {
        this.setState({newZerotierKey: event.target.value});
    }

    removeZerotierNetwork = (val) => {
        //remove a zerotier network
        fetch('/api/vpnzerotierdel', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                network: val
            })
        }).then(response => response.json()).then(state => {
            this.setState(state)
        }).catch(error => {
            this.setState({waiting: false, error: "Error removing network: " + error})
        });
    }

    addZerotierNetwork = () => {
        //add a zerotier network
        fetch('/api/vpnzerotieradd', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                network: this.state.newZerotierKey
            })
        }).then(response => response.json()).then(state => {
            this.setState(state)
        }).catch(error => {
            this.setState({waiting: false, error: "Error removing network: " + error})
        });
    }

    activateWireguardNetwork = (val) => {
        // activate wireguard network
        fetch('/api/vpnwireguardactivate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                network: val
            })
        }).then(response => response.json()).then(state => {
            this.setState(state)
        }).catch(error => {
            this.setState({waiting: false, error: "Error activating network: " + error})
        });
    }

    deactivateWireguardNetwork = (val) => {
        // activate wireguard network
        fetch('/api/vpnwireguarddeactivate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                network: val
            })
        }).then(response => response.json()).then(state => {
            this.setState(state)
        }).catch(error => {
            this.setState({waiting: false, error: "Error deactivating network: " + error})
        });
    }

    deleteWireguardNetwork = (val) => {
        //delete a wireguard profile
        fetch('/api/vpnwireguardelete', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                network: val
            })
        }).then(response => response.json()).then(state => {
            this.setState(state)
        }).catch(error => {
            this.setState({waiting: false, error: "Error deleting network: " + error})
        });
    }

    handleNewNetBirdSetupKey = (event) => {
        this.setState({newNetBirdSetupKey: event.target.value});
    }

    requestNetBirdInfo = () => {
        fetch(`/api/vpn/netbird/info`, {
                headers: {
                    Authorization: `Bearer ${this.state.token}`
                }
            }
        ).then(response => response.json()).then(state => {
            this.setState(state);
            this.setState({newNetBirdSetupKey: state.statusNetBird.text.config?.['SETUP_KEY']})
        }).catch(error => {
            this.setState({waiting: false, error: error})
        });
    }

    addNetBirdSetupKey = () => {
        //add a setup key
        fetch('/api/vpn/netbird/add-setup-key', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
            body: JSON.stringify({
                setupKey: this.state.newNetBirdSetupKey
            })
        }).then(response => response.json()).then(state => {
            this.setState(state)
            this.requestNetBirdInfo()

            window.location.reload();
        }).catch(error => {
            this.setState({waiting: false, error: "Error configuring setup key: " + error})
        });
    }

    deleteNetBirdSetupKey = () => {
        //add a setup key
        fetch('/api/vpn/netbird/delete-setup-key', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
        }).then(response => response.json()).then(state => {
            this.setState(state)
            this.requestNetBirdInfo()

            window.location.reload();
        }).catch(error => {
            this.setState({waiting: false, error: "Error deleting setup key: " + error})
        });
    }

    runNetBirdService = () => {
        this.setState({waiting: true})

        //add a setup key
        fetch('/api/vpn/netbird/run', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
        }).then(response => response.json()).then(state => {
            window.location.reload();
        }).catch(error => {
            this.setState({waiting: false, error: "Error running NetBird: " + error})
        });
    }

    stopNetBirdService = () => {
        this.setState({waiting: true})

        //add a setup key
        fetch('/api/vpn/netbird/stop', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.token}`
            },
        }).then(response => response.json()).then(state => {
            window.location.reload();
        }).catch(error => {
            this.setState({waiting: false, error: "Error stopping NetBird: " + error})
        });
    }

    fileChangeHandler = (event) => {
        this.setState({selectedWGFile: event.target.files[0]});
    };

    renderTitle() {
        return 'VPN Services'
    }

    renderContent() {
        return (
            <div style={{width: 800}}>
                <ul className="nav nav-tabs" role="tablist" id="tabVpn">
                    {this.state.vpnOptions.map((item, index) => (
                        <li className="nav-item" key={item.value}>
                            <button className={`nav-link ${index === 0 ? 'active' : ''} `} id={`${item.value}-tab`}
                                    data-bs-toggle="tab" data-bs-target={`#${item.value}`} type="button" role="tab"
                                    aria-controls={item.value} aria-selected="true">{item.label}</button>
                        </li>
                    ))}
                </ul>

                <div className="tab-content" id="tabVpnContent">
                    <div className="tab-pane fade show active" id="zerotier" role="tabpanel"
                         aria-labelledby="zerotier-tab">
                        <div className="row mt-1">
                            <p>Installed: {this.state.statusZerotier.installed == true ? 'Yes' : 'No'}</p>
                            <p>Active: {this.state.statusZerotier.status == true ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="row mt-1">
                            <Table striped bordered>
                                <thead>
                                <tr>
                                    <th>Network ID</th>
                                    <th>Network Name</th>
                                    <th>IP</th>
                                    <th>Status</th>
                                    <th>Type</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.statusZerotier.text.map((item) => (
                                    <tr key={item.nwid}>
                                        <td>{item.nwid}</td>
                                        <td>{item.name}</td>
                                        <td>{item.assignedAddresses}</td>
                                        <td>{item.status}</td>
                                        <td>{item.type}</td>
                                        <td>
                                            <Button size="sm" id={item.nwid}
                                                    onClick={() => this.removeZerotierNetwork(item.nwid)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="row mt-1">
                            <div className="form-group row" style={{marginBottom: '5px'}}>
                                <label className="col-sm-4 col-form-label ">Add new network by key: </label>
                                <div className="col-sm-4">
                                    <Form.Control type="text" name="ipaddress" disabled={!this.state.statusZerotier.status}
                                                  value={this.state.newZerotierKey}
                                                  onChange={this.handlenewZerotierKey}/>
                                    <Button id="addzt"
                                            disabled={!this.state.statusZerotier.status || this.state.newZerotierKey === ''}
                                            onClick={() => this.addZerotierNetwork()}>Add</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tab-pane fade show" id="wireguard" role="tabpanel" aria-labelledby="wireguard-tab">
                        <div className="row mt-1">
                            <p>Installed: {this.state.statusWireguard.installed == true ? 'Yes' : 'No'}</p>
                            <p>Active: {this.state.statusWireguard.status == true ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="row mt-1">
                            <Table striped bordered>
                                <thead>
                                <tr>
                                    <th>Network Conf File</th>
                                    <th>Local IP</th>
                                    <th>Server IP</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.statusWireguard.text.map((item) => (
                                    <tr key={item.profile}>
                                        <td>{item.profile}</td>
                                        <td>{item.peer}</td>
                                        <td>{item.server}</td>
                                        <td>{item.status}</td>
                                        <td>
                                            <div style={{display: (item.status === 'disabled') ? "block" : "none"}}>
                                                <Button size="sm" id={item.file}
                                                        onClick={() => this.activateWireguardNetwork(item.profile)}>Activate</Button>
                                            </div>
                                            <div style={{display: (item.status !== 'disabled') ? "block" : "none"}}>
                                                <Button size="sm" id={item.file}
                                                        onClick={() => this.deactivateWireguardNetwork(item.profile)}>Deactivate</Button>
                                            </div>
                                            <Button size="sm" id={item.file} disabled={item.status !== 'disabled'}
                                                    onClick={() => this.deleteWireguardNetwork(item.profile)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="row mt-1">
                            <div className="form-group row" style={{marginBottom: '5px'}}>
                                <label className="col-sm-4 col-form-label ">Add new Wireguard profile</label>
                                <div className="col-sm-6">
                                    <Form id='uploadForm'
                                          action='/api/vpnwireguardprofileadd'
                                          method='post'
                                          encType="multipart/form-data">
                                        <Form.Control type="file" name="wgprofile" disabled={!this.state.statusWireguard.status}
                                                      onChange={this.fileChangeHandler} accept=".conf, .config"/>
                                        <Button type='submit' value='Upload'
                                                disabled={this.state.selectedWGFile === ''}>Upload</Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tab-pane fade show" id="netbird" role="tabpanel" aria-labelledby="netbird-tab">
                        <div className="row mt-1">
                            <p>Installed: {this.state.statusNetBird.installed == true ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="row mt-1">
                            <Table striped bordered>
                                <thead>
                                <tr>
                                    <th>NetBird IP</th>
                                    <th>Peers</th>
                                    <th>Status</th>
                                    <th>Peers count</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{this.state.statusNetBird.text.status?.['netbirdIp'] ?? '-'}</td>
                                    <td>
                                        {this.state.statusNetBird.text.status?.['peers']?.['details']?.map((peer, index) => (
                                            <div>
                                                <p>IP: {peer.netbirdIp} - {peer.status}</p>
                                                <p>Local IP: {peer?.iceCandidateEndpoint?.local ?? '-'}</p>
                                                <p>Remote IP: {peer?.iceCandidateEndpoint?.remote ?? '-'}</p>
                                            </div>
                                        ))}
                                    </td>
                                    <td>{this.state.statusNetBird.text.status?.['peers']['connected'] > 0 ? 'Connected' : 'Disconnected'}</td>
                                    <td>{this.state.statusNetBird.text.status?.peers?.total ?? '-'}</td>
                                    <td>
                                        <Button className="btn-success me-1" id="runNetBirdService" disabled={this.state.newNetBirdSetupKey === '' || this.state.waiting} onClick={() => this.runNetBirdService()}>Run</Button>
                                        <Button className="btn-warning me-1" id="stopNetBirdService" disabled={this.state.newNetBirdSetupKey === '' || this.state.waiting} onClick={() => this.stopNetBirdService()}>Stop</Button>
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </div>
                        <div className="row mt-1">
                            <div className="form-group row" style={{marginBottom: '15px'}}>
                                <label className="col-sm-2 col-form-label ">SETUP_KEY: </label>
                                <div className="col-sm-6">
                                    <Form.Control type="text" name="setup_key" value={this.state.newNetBirdSetupKey} onChange={this.handleNewNetBirdSetupKey}/>
                                </div>
                                <div className="col-sm-2">
                                    <Button id="addNetBirdSetupKey" disabled={this.state.newNetBirdSetupKey === ''} onClick={() => this.addNetBirdSetupKey()}>Save</Button>
                                </div>
                                <div className="col-sm-2">
                                    <Button id="deleteNetBirdSetupKey" disabled={this.state.newNetBirdSetupKey === ''} onClick={() => this.deleteNetBirdSetupKey()}>Delete</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default VPNPage
