DESTINATION=$(pwd)/build
DESTINATION_PACK_PATTERN=$DESTINATION/*.tgz;

mkdir -p $DESTINATION;
rm -rf $DESTINATION_PACK_PATTERN;

(cd ../..; npm pack; mv *.tgz $DESTINATION;)

FULL_PACKAGE_NAME="@reclaimprotocol/inapp-rn-sdk"

for pack_path in $DESTINATION_PACK_PATTERN; do
    echo "Unpacking $pack_path";
    pack_name=$(basename $pack_path .tgz);
    echo "Pack name: $pack_name";
    echo "Unpacking"
    rm -rf $DESTINATION/package;
    tar -xvzf $pack_path -C $DESTINATION;
    echo "Removing $pack_path"
    rm -rf $pack_path;
    echo "Installing $pack_name";
    rm node_modules/$FULL_PACKAGE_NAME;
    mv $DESTINATION/package node_modules/$FULL_PACKAGE_NAME;
    echo "Installed $pack_name";
done
