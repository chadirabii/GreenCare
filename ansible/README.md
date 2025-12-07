# Ansible Module

## Setup
- Install ansible (use WSL)
- Test ansible
```bash
ansible local -m ping
```

- Install ansible collections 
```bash
ansible-galaxy collection install community.docker
ansible-galaxy collection install kubernetes.core
```
    
- Install pip libraries
```bash
pip install docker kubernetes
```

- Run playbook
```bash
ansible-playbook playbooks/full-deploy.yml
```
