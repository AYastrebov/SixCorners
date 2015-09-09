//
//  GlobalSettings.h
//  6Corners
//
//  Created by Andrey Yastrebov on 20.02.11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@interface GlobalSettings : NSObject 
{
	CCTMXTiledMap *hexMap;
	
	NSUInteger xOffSet;
	NSUInteger yOffSet;
	
	NSUInteger scale;
}

- (id)initWithHexMap:(CCTMXTiledMap *)map;
- (CGPoint)offSet;
- (CGSize)tileSize;

@end
