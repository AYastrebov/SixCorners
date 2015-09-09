//
//  SupportScene.h
//  6Corners
//
//  Created by Andrey Yastrebov on 3/6/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@interface SupportScene : CCLayer 

{
    NSString *menuPath;
	NSString *menuButtonsPath;
	NSString *gameFieldPath;
}

+ (id) scene;

@end
