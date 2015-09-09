//
//  GlobalSettings.m
//  6Corners
//
//  Created by Andrey Yastrebov on 20.02.11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "GlobalSettings.h"


@implementation GlobalSettings

- (id)initWithHexMap:(CCTMXTiledMap *)map
{
	if ((self = [super init])) 
	{
		hexMap = [map retain];
		
		if ([[UIScreen mainScreen] respondsToSelector:@selector(displayLinkWithTarget:selector:)] &&
			([UIScreen mainScreen].scale == 2.0)) 
		{
			NSLog(@"Retina");
			scale = 2;
		} 
		else 
		{
			NSLog(@"Non-Retina");
			scale = 1;
		}
		
		xOffSet = round(hexMap.tileSize.height/(6 * scale) * sqrt(3) * 3);
		yOffSet = hexMap.tileSize.height/scale;
		
	}
	return self;
}

- (CGPoint)offSet
{
	return CGPointMake(xOffSet, yOffSet);
}

- (CGSize)tileSize
{
	return CGSizeMake(hexMap.tileSize.width/scale, hexMap.tileSize.height/scale);
}

- (void)dealloc
{
	[hexMap release];
	[super dealloc];
}

@end
