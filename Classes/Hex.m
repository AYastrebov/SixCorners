//
//  Hex.m
//  6Corners
//
//  Created by Andrey Yastrebov on 2/12/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "Hex.h"


@implementation Hex
@synthesize positionPix, positionMap, isFilled, tag;

- (id) initWithLocation:(CGPoint)location
{
	if( (self=[super init] )) 
	{
		self.positionPix = location;
	}
	return self;
}

- (void)setFilled:(BOOL)filled
{
	self.isFilled = filled;
}

@end
