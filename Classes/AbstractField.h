//
//  AbstractField.h
//  6Corners
//
//  Created by Andrey Yastrebov on 2/12/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "cocos2d.h"

@class SectionArray;

@interface AbstractField : NSObject 

+ (SectionArray *)createAbstractField:(CCTMXTiledMap *)hexMap;
+ (NSArray *)tagsArray;
+ (CCArray *)hexesArray:(SectionArray *)field ignoreFilled:(BOOL)b;
+ (CCArray *)winRowsArray:(CCArray *)hexes;
+ (SectionArray *)winTags:(CCArray *)winHexes;

@end
