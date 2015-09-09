//
//  Hex.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/12/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface Hex : NSObject 
{
	CGPoint positionPix;
	CGPoint positionMap;
	BOOL isFilled;
	NSUInteger tag;
}

@property CGPoint positionPix;
@property CGPoint positionMap;
@property BOOL isFilled;
@property NSUInteger tag;

- (id) initWithLocation:(CGPoint)location;
- (void)setFilled:(BOOL)filled;

@end
