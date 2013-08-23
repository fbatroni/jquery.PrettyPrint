# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'yaml'
require 'json'



def get_config ()
  parsed = begin
    @cwd = Dir.pwd
    config = YAML.load(File.open("#{@cwd}/manifest.yaml"))
    return config
  rescue ArgumentError => e
    puts "Could not parse YAML: #{e.message}"
    exit 1
  end
end

@storm_manifest = get_config

def create_bootstrap ()
  bootstrap_sh = <<SHELL
#!/bin/bash
USER_HOME=$(eval echo ~${SUDO_USER})
echo "local dir `pwd`, and home $(USER_HOME)"; su -l -c 'cd ~/#{@storm_manifest["env"][0]["clone_directory"]};#{@storm_manifest["env"][0]["bootstrap_shell_command"]};stew refresh; stew start;touch .bootstrapped' glgapp;

SHELL

  bootstrap_file = "#{Dir.pwd}/.bootstrap.sh"
  File.open(bootstrap_file, 'w') {|f| f.write(bootstrap_sh) } #if File.exist? bootstrap_file
  FileUtils.chmod 0777, bootstrap_file
end

`curl http://filerepo.glgroup.com/vagrant/id_rsa_vagrant.txt > ~/.ssh/id_rsa_vagrant`
`chmod 0600 ~/.ssh/id_rsa_vagrant`
rsa_key = File.expand_path('~') + '/.ssh/id_rsa_vagrant'

   
Vagrant::Config.run do |config|

  config.vm.box = "glgub"
  config.vm.box_url = "http://filerepo.glgroup.com/vagrant/ubuntu/11-10/latest/glgub11-10.box"
  config.ssh.private_key_path = rsa_key
  #config.vm.network :hostonly, "192.168.33.10"
  #config.vm.customize ["modifyvm", :id, "--name", @storm_manifest["env"][0]["clone_directory"], "--memory", "1024"]
  config.vm.forward_port @storm_manifest["env"][0]["load_balancer_server_port"], @storm_manifest["env"][0]["load_balancer_server_port"], :auto=>true  if @storm_manifest["env"][0]["load_balancer_server_port"]
  config.vm.forward_port 9000, 9000
  config.vm.forward_port 9001, 9002
  config.vm.forward_port 9002, 9002
  config.vm.share_folder "v-root", "/home/glgapp/#{@storm_manifest["env"][0]["clone_directory"]}", ".", :create=>true
  config.vm.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]

  Vagrant::Config.run do |config|
    unless File.exists? "#{Dir.pwd}/.bootstrapped"
	if (@storm_manifest["env"][0]["bootstrap_shell_command"] || @storm_manifest["env"][0]["stew"] == true)
      		create_bootstrap
      		config.vm.provision :shell, :path => ".bootstrap.sh" 
    #config.vm.provision :shell, :inline => "cd ~/#{get_config["env"][0]["clone_directory"]};stew refresh; stew start"
    	end
    end 
 end

end