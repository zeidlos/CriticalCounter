#!/bin/bash
ionic cordova build browser
echo 'Deploying App to Github'
cp -R www/ ../CriticalCounterWebApp/
cd ../CriticalCounterWebApp/
git add .
git commit -m 'Autodeploy'
git push origin master