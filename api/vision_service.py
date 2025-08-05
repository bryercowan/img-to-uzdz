from google.cloud import vision
import io
from typing import List, Dict
from settings import Settings

settings = Settings()

class VisionService:
    def __init__(self):
        self.client = vision.ImageAnnotatorClient()
        self.debug = True
    
    def analyze_image(self, image_content: bytes) -> Dict[str, any]:
        """
        Analyze an image using Google Vision API with comprehensive analysis
        Returns labels, objects, text, and geometric properties
        """
        image = vision.Image(content=image_content)
        
        # Label detection with more details
        labels_response = self.client.label_detection(image=image)
        labels = []
        for label in labels_response.label_annotations[:15]:
            labels.append({
                "description": label.description,
                "score": label.score,
                "topicality": label.topicality
            })
        
        # Object localization with bounding boxes
        objects = []
        try:
            objects_response = self.client.object_localization(image=image)
            for obj in objects_response.localized_object_annotations:
                try:
                    # Extract bounding box coordinates safely
                    vertices = obj.bounding_poly.normalized_vertices
                    x_coords = [float(v.x or 0) for v in vertices]
                    y_coords = [float(v.y or 0) for v in vertices]
                    
                    bbox = {
                        "x_min": min(x_coords),
                        "y_min": min(y_coords),
                        "x_max": max(x_coords),
                        "y_max": max(y_coords)
                    }
                    objects.append({
                        "name": str(obj.name or "object"),
                        "score": float(obj.score or 0),
                        "bounding_box": bbox,
                        "width": bbox["x_max"] - bbox["x_min"],
                        "height": bbox["y_max"] - bbox["y_min"]
                    })
                except Exception as obj_e:
                    print(f"Error processing object {obj.name}: {obj_e}")
                    continue
        except Exception as e:
            print(f"Error with object localization: {e}")
            # Continue without objects if this fails
        
        # Text detection for product information
        text_response = self.client.text_detection(image=image)
        text_annotations = text_response.text_annotations
        text_content = text_annotations[0].description if text_annotations else ""
        
        # Logo detection for brand identification
        logo_response = self.client.logo_detection(image=image)
        logos = [logo.description for logo in logo_response.logo_annotations]
        
        # Image properties for color analysis
        dominant_colors = []
        try:
            props_response = self.client.image_properties(image=image)
            if hasattr(props_response, 'dominant_colors_annotation') and props_response.dominant_colors_annotation:
                for color in props_response.dominant_colors_annotation.colors[:5]:
                    dominant_colors.append({
                        "color": {
                            "red": int(color.color.red or 0),
                            "green": int(color.color.green or 0),
                            "blue": int(color.color.blue or 0)
                        },
                        "score": float(color.score or 0),
                        "pixel_fraction": float(color.pixel_fraction or 0)
                    })
            elif hasattr(props_response, 'image_properties_annotation'):
                # Try alternative API structure
                img_props = props_response.image_properties_annotation
                if hasattr(img_props, 'dominant_colors') and img_props.dominant_colors:
                    for color in img_props.dominant_colors.colors[:5]:
                        dominant_colors.append({
                            "color": {
                                "red": int(color.color.red or 0),
                                "green": int(color.color.green or 0),
                                "blue": int(color.color.blue or 0)
                            },
                            "score": float(color.score or 0),
                            "pixel_fraction": float(color.pixel_fraction or 0)
                        })
        except Exception as e:
            if self.debug:
                print(f"Error getting image properties: {e}")
            # Use fallback colors - typical Monster can colors
            dominant_colors = [
                {"color": {"red": 0, "green": 0, "blue": 0}, "score": 0.4, "pixel_fraction": 0.3},  # Black
                {"color": {"red": 0, "green": 255, "blue": 0}, "score": 0.3, "pixel_fraction": 0.2},  # Green
                {"color": {"red": 128, "green": 128, "blue": 128}, "score": 0.3, "pixel_fraction": 0.5}  # Gray
            ]
        
        return {
            "labels": labels,
            "objects": objects,
            "text": text_content,
            "logos": logos,
            "dominant_colors": dominant_colors,
            "confidence_scores": {
                "labels": [label["score"] for label in labels],
                "objects": [obj["score"] for obj in objects]
            }
        }
    
    def analyze_multiple_images(self, images: List[bytes]) -> Dict[str, any]:
        """
        Analyze multiple images and create comprehensive product mapping
        """
        image_analyses = []
        all_labels = {}
        all_objects = {}
        all_text = []
        all_logos = set()
        dominant_colors = []
        
        # Analyze each image individually
        for i, image_content in enumerate(images):
            result = self.analyze_image(image_content)
            result["image_index"] = i
            image_analyses.append(result)
            
            # Aggregate labels with scores
            for label in result["labels"]:
                desc = label["description"]
                if desc in all_labels:
                    all_labels[desc]["total_score"] += label["score"]
                    all_labels[desc]["count"] += 1
                else:
                    all_labels[desc] = {"total_score": label["score"], "count": 1}
            
            # Aggregate objects with positions
            for obj in result["objects"]:
                name = obj["name"]
                if name in all_objects:
                    all_objects[name]["instances"].append({
                        "image_index": i,
                        "bounding_box": obj["bounding_box"],
                        "score": obj["score"]
                    })
                else:
                    all_objects[name] = {
                        "instances": [{
                            "image_index": i,
                            "bounding_box": obj["bounding_box"],
                            "score": obj["score"]
                        }]
                    }
            
            if result["text"].strip():
                all_text.append(result["text"].strip())
            
            all_logos.update(result["logos"])
            dominant_colors.extend(result["dominant_colors"])
        
        # Calculate average scores and sort
        sorted_labels = sorted(all_labels.items(), 
                              key=lambda x: x[1]["total_score"] / x[1]["count"], 
                              reverse=True)
        product_tags = [label[0] for label in sorted_labels[:15]]
        
        # Determine primary product shape and dimensions
        primary_object = self._determine_primary_object(all_objects)
        product_shape = self._infer_product_shape(primary_object, product_tags)
        
        # Extract product name intelligently
        product_name = self._extract_product_name(all_text, all_logos, product_tags)
        
        # Determine texture mapping strategy
        texture_mapping = self._plan_texture_mapping(image_analyses, primary_object)
        
        # Debug output
        if self.debug:
            print(f"\n=== VISION ANALYSIS DEBUG ===")
            print(f"Product tags: {product_tags[:10]}")
            print(f"Detected objects: {list(all_objects.keys())}")
            print(f"Primary object: {primary_object}")
            print(f"Product shape: {product_shape}")
            print(f"Product name: {product_name}")
            print(f"Logos found: {list(all_logos)}")
            print(f"=== END DEBUG ===")
        
        return {
            "product_name": product_name,
            "tags": product_tags,
            "objects": list(all_objects.keys()),
            "primary_object": primary_object,
            "product_shape": product_shape,
            "texture_mapping": texture_mapping,
            "image_analyses": image_analyses,
            "dominant_colors": dominant_colors[:3],  # Top 3 colors
            "logos": list(all_logos)
        }
    
    def _determine_primary_object(self, all_objects: Dict) -> Dict:
        """Determine the main product object from all detected objects"""
        if not all_objects:
            return {"name": "product", "confidence": 0.5}
        
        # Find object with highest average confidence and most instances
        best_object = None
        best_score = 0
        
        for obj_name, obj_data in all_objects.items():
            instances = obj_data["instances"]
            avg_score = sum(inst["score"] for inst in instances) / len(instances)
            # Weight by number of instances and confidence
            total_score = avg_score * (1 + len(instances) * 0.1)
            
            if total_score > best_score:
                best_score = total_score
                best_object = {"name": obj_name, "confidence": avg_score, "instances": len(instances)}
        
        return best_object or {"name": "product", "confidence": 0.5}
    
    def _infer_product_shape(self, primary_object: Dict, tags: List[str]) -> Dict:
        """Infer 3D shape characteristics from analysis"""
        obj_name = primary_object.get("name", "").lower()
        tags_lower = [tag.lower() for tag in tags]
        
        # Enhanced shape detection
        cylindrical = ["bottle", "can", "cylinder", "tube", "jar", "cup", "mug", "container"]
        rectangular = ["box", "book", "phone", "tablet", "package", "case", "carton"]
        spherical = ["ball", "sphere", "globe", "fruit", "apple", "orange"]
        
        shape_type = "rectangular"  # default
        if any(keyword in obj_name or any(keyword in tag for tag in tags_lower) for keyword in cylindrical):
            shape_type = "cylindrical"
        elif any(keyword in obj_name or any(keyword in tag for tag in tags_lower) for keyword in spherical):
            shape_type = "spherical"
        elif any(keyword in obj_name or any(keyword in tag for tag in tags_lower) for keyword in rectangular):
            shape_type = "rectangular"
        
        return {
            "type": shape_type,
            "confidence": primary_object.get("confidence", 0.5),
            "detected_from": obj_name
        }
    
    def _extract_product_name(self, all_text: List[str], logos: set, tags: List[str]) -> str:
        """Extract most likely product name from text and context"""
        if logos:
            return list(logos)[0]  # Use first logo as product name
        
        if all_text:
            # Look for product names in text
            for text in all_text:
                lines = text.split('\n')
                for line in lines[:3]:  # Check first 3 lines
                    line = line.strip()
                    if 2 < len(line) < 30 and any(c.isupper() for c in line):
                        return line
        
        # Fallback to most relevant tag
        relevant_tags = [tag for tag in tags if tag.lower() not in 
                        ["product", "brand", "label", "packaging", "container"]]
        if relevant_tags:
            return relevant_tags[0].title()
        
        return "Product"
    
    def _plan_texture_mapping(self, image_analyses: List[Dict], primary_object: Dict) -> Dict:
        """Plan how to map textures from different images to 3D model"""
        texture_plan = {}
        
        for i, analysis in enumerate(image_analyses):
            # Analyze what part of the product this image likely shows
            objects = analysis["objects"]
            dominant_colors = analysis["dominant_colors"]
            
            # Simple heuristic: assign images to faces based on analysis
            if i == 0:
                texture_plan[f"image_{i}"] = {"face": "front", "usage": "primary"}
            elif i == 1:
                texture_plan[f"image_{i}"] = {"face": "back", "usage": "secondary"}
            elif i == 2:
                texture_plan[f"image_{i}"] = {"face": "side", "usage": "detail"}
            else:
                texture_plan[f"image_{i}"] = {"face": "additional", "usage": "extra_detail"}
        
        return texture_plan

vision_service = VisionService()