lograbbit
==================
Introduction
------------------
This is a [node.js](http://www.nodejs.org) web interface to manage [logstash](http://www.logstash.net) and its configuation file. Support only Linux and Windows(test in CentOS 6.5 and Windows 7 64bit)    
The function point:    
1.  start/end logstash agent    
2.  view/edit/delete logstash config file, and start logstash with specified config file    
    
How to use it
-------------------
Download the zip, extract it and put files in the directory "/logstash-1.x.x/bin",     
run     
`node server.js \[port\]`     
port default is 3000, then use browser access     
`http://yourip:yourport/`          
you can use it to manage logstash and its configuation file!
