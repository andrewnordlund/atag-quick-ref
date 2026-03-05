echo "You're currently working in:"
pwd

cleanUp="true"

if [ $# -gt 0 ]; then
  if [ $1 == "false"]; then
    cleanUp="false"
  fi 
fi

if [ -d dist ]; then
  rm -Rf dist
fi
if [ -d build ]; then
  rm -Rf build
fi

mkdir dist build
cp src/* build/
cp build/* dist/
if [ ! -e "node_modules/aag-as-json/atag.json" ]; then
  echo "Installing atag module"
  npm install atag-as-json --prefix .
  ls -Rl
  cp node_modules/atag-as-json/atag.json dist/
else
  echo "Not installing module"
fi
ls -Rl

if [ "$cleanUp" == "true" ]; then
  rm -Rf build
fi

